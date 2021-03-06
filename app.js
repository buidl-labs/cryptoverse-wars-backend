const axios = require("axios");
const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const FormData = require("form-data");
const { Readable } = require("stream");

const { sequelize, Module, Chapter, User } = require("./models");
const addChapter = require("./utils/add-chapters");
const userRoutes = require("./routes/User");
const cryptobotRoutes = require("./routes/Cryptobot");

// load vars from `.env` file to process.env
if (process.NODE_ENV === "development") require("dotenv").config();

let PINATA_API_KEY = process.env.PINATA_API_KEY;
let PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY) {
	throw new Error("Pinata api key must have a value!");
}
if (!PINATA_SECRET_API_KEY) {
	throw new Error("Pinata secret api key must have a value!");
}

const app = express();
const port = process.env.PORT || 3001;

//3d model compression lib
const gltfPipeline = require("gltf-pipeline");
const processGlb = gltfPipeline.processGlb;

const glbCompressionOptions = {
	dracoOptions: {
		compressionLevel: 10,
	},
};

// middlewares

// allows cors for all origins
app.use(cors());
// to accomodate file uploads
app.use(fileUpload());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());
// logging middleware
app.use(morgan("tiny"));

function char2Bytes(str) {
	return Buffer.from(str, "utf8").toString("hex");
}

app.post("/api/upload-json-metadata-to-ipfs", async (req, res) => {
	const { artifactURI, displayURI, xtzAddress } = req.body;
	if (!artifactURI || !displayURI) {
		res.status(400).json({
			error: "artifactURI, displayURI is missing.",
		});
	}

	if (!xtzAddress) {
		res.status(400).json({
			error: "Creator address is missing.",
		});
	}
	const metadata = {
		name: "3D Cryptobot",
		symbol: "CB",
		decimals: 0,
		description: "NFT 3d cryptobot",
		isBooleanAmount: true,
		isTransferable: true,
		shouldPreferSymbol: false,
		language: "en",
		tags: ["3D model", "Collectables", "NFT", "Cryptobot"],
		externalUri: "https://cryptocodeschool.in/tezos/",
		artifactUri: `ipfs://${artifactURI}`,
		displayUri: `ipfs://${displayURI}`,
		thumbnailUri: "ipfs://QmXqZLz5UyEoYsn41CM9jf9cN2XurLQ8NML8hVTea2FnqT",
		date: new Date().toString(),
		creators: [xtzAddress],
	};

	const URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
	try {
		const result = await axios.post(URL, metadata, {
			headers: {
				pinata_api_key: PINATA_API_KEY,
				pinata_secret_api_key: PINATA_SECRET_API_KEY,
			},
		});
		const data = await result.data;

		res.json({
			ipfsHash: char2Bytes(`ipfs://${data.IpfsHash}`),
			timestamp: data.Timestamp,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			error: "Error uploading JSON metadata to IPFS",
		});
	}
});

app.post("/api/upload-image-to-ipfs", async (req, res) => {
	const botImg = req.files.file.data;

	const buffer = Buffer.from(botImg, "base64");
	const readable = new Readable();
	readable._read = () => {}; // _read is required but you can noop it
	readable.push(buffer);
	readable.push(null);
	// console.log(readable);
	const form = new FormData();
	form.append("file", botImg, {
		filename: "cryptobot.png",
	});

	// console.log(new Image(botImg));

	const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

	var config = {
		method: "post",
		url: url,
		maxBodyLength: Infinity,
		headers: {
			pinata_api_key: PINATA_API_KEY,
			pinata_secret_api_key: PINATA_SECRET_API_KEY,
			...form.getHeaders(),
		},
		data: form,
	};

	try {
		const output = await axios(config);

		res.send({
			success: true,
			body: {
				ipfsHash: output.data.IpfsHash,
				timestamp: output.data.Timestamp,
			},
		});
	} catch (err) {
		res.status(400).send({
			success: false,
			error: "Error uploading bot image to IPFS",
		});
	}
});

app.post("/api/upload-3d-model-to-ipfs", async (req, res) => {
	//   console.log(req.body);
	const sizeBeforeCompression = Buffer.byteLength(req.files.file.data);
	// Compress 3d model
	const bot = await processGlb(req.files.file.data, glbCompressionOptions);

	// Convert buffer into readable stream
	const buffer = Buffer.from(bot.glb, "binary");
	const sizeAfterCompression = Buffer.byteLength(buffer);
	console.log("Size before compression", `${sizeBeforeCompression}bytes`);
	console.log("Size after compression", `${sizeAfterCompression}bytes`);
	console.log(
		"Size reduced by",
		100 - Math.round((sizeAfterCompression / sizeBeforeCompression) * 100),
		"%"
	);
	const readable = new Readable();
	readable._read = () => {}; // _read is required but you can noop it
	readable.push(buffer);
	readable.push(null);

	const form = new FormData();
	form.append("file", readable, {
		filename: "custom.glb", //required or it fails
	});

	const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

	var config = {
		method: "post",
		url: url,
		maxBodyLength: Infinity,
		headers: {
			pinata_api_key: PINATA_API_KEY,
			pinata_secret_api_key: PINATA_SECRET_API_KEY,
			...form.getHeaders(),
		},
		data: form,
	};

	try {
		const output = await axios(config);

		res.send({
			success: true,
			body: {
				ipfsHash: output.data.IpfsHash,
				timestamp: output.data.Timestamp,
			},
		});
	} catch (err) {
		res.status(400).send({
			error: "Error uploading custom 3D Model to IPFS",
			success: false,
		});
	}
});

app.use("/user", userRoutes);
app.use("/cryptobot", cryptobotRoutes);

app.get("/", (req, res) => res.send("Hello from cryptoverse wars!"));

app.listen(port, async () => {
	console.log(`Listening on port ${port}!`);
	// await sequelize.authenticate();

	await sequelize.sync({ alter: true });

	// await Module.destroy({
	// 	where: {},
	// 	truncate: "CASCADE",
	// });
	// await Chapter.destroy({
	// 	where: {},
	// 	truncate: "CASCADE",
	// });
	// await addChapter(Module, Chapter);

	console.log("Lezzz go 🚀");
});
