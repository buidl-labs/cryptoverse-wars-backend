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

app.post("/api/upload-json-metadata-to-ipfs", async (req, res) => {
	const { artifactURI, displayURI, tokenID } = req.body;
	if (!artifactURI || !displayURI || !tokenID) {
		res.status(400).json({
			error: "artifactURI, displayURI, or tokenID is missing.",
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
		tokenId: tokenID,
	};

	const URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
	const result = await axios.post(URL, metadata, {
		headers: {
			pinata_api_key: PINATA_API_KEY,
			pinata_secret_api_key: PINATA_SECRET_API_KEY,
		},
	});
	const data = await result.data;

	res.json({
		ipfsHash: data.IpfsHash,
		timestamp: data.Timestamp,
	});
});

app.post("/api/upload-image-to-ipfs", async (req, res) => {
	const botImg = req.files.file.data;

	const buffer = Buffer.from(botImg, "base64");
	const readable = new Readable();
	readable._read = () => {}; // _read is required but you can noop it
	readable.push(buffer);
	readable.push(null);
	console.log(readable);
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

	// Compress 3d model
	const bot = await processGlb(req.files.file.data, glbCompressionOptions);

	// Convert buffer into readable stream
	const buffer = Buffer.from(bot.glb, "binary");
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
			success: false,
			error: "Error uploading custom 3D Model to IPFS",
		});
	}
});

app.use("/user", userRoutes);

app.get("/", (req, res) => res.send("Hello from cryptoverse wars!"));

app.listen(port, async () => {
	console.log(`Listening on port ${port}!`);
	// await sequelize.authenticate();

	/*
		Uncomment the next two lines if you want to drop the current DB and
		add the data for chapters and modules to the DB.
	*/

	await sequelize.sync({ alter: true });
	// await addChapter(Module, Chapter);
	// await User.create({xtzAddress: '', email: '', verified: true})

	console.log("Lezzz go 🚀");
});
