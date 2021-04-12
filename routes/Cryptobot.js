const express = require("express");
const router = express.Router();

const { Cryptobot } = require("../models");
const FormData = require("form-data");
const axios = require("axios");
const { Readable } = require("stream");
const { findCreatorByTokenId } = require("../utils/api-helpers");

router.get("/", async (req, res) => {
	const { id } = req.query;

	try {
		const bot = await Cryptobot.findOne({ where: { token_id: id } });
		if (!bot) {
			throw new Error();
		}
		res.json(bot);
	} catch {
		res.status(404).json({ error: "CRYPTOBOT_NOT_FOUND" });
	}
});

router.get("/all", async (req, res) => {
	try {
		const bots = await Cryptobot.findAll();
		if (!bots) {
			throw new Error();
		}
		res.json(bots);
	} catch (err) {
		res.status(404).json({ error: err.toString() });
	}
});

router.post("/", async (req, res) => {
	const { id, imageURI } = req.body;

	try {
		if (!imageURI.includes("ipfs://"))
			return res
				.status(400)
				.json({ error: "imageURI must start with ipfs://" });
		console.log("ID", id);
		let bot = await Cryptobot.findOne({ where: { token_id: id } });

		if (!bot) {
			const address = await findCreatorByTokenId(id);
			console.log(address);
			bot = await Cryptobot.create({
				token_id: id,
				imageURI: imageURI,
				mintedBy: address,
			});
			return res.status(201).json(bot);
		}
		return res.json(bot);
	} catch (err) {
		console.log(err);
		return res.status(500).json(err.toString());
	}
});

router.post("/upload-image", async (req, res) => {
	if (process.NODE_ENV === "development") require("dotenv").config();

	let PINATA_API_KEY = process.env.PINATA_API_KEY;
	let PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

	const botImage = req.files.botImage;
	if (!botImage)
		return res.status(400).json({ error: "Couldn't find field botImage" });

	const form = new FormData();
	const readable = new Readable();
	readable._read = () => {}; // _read is required but you can noop it
	readable.push(botImage.data);
	readable.push(null);
	form.append("file", readable, {
		filename: "cryptobot.png",
	});

	// console.log(typeof botImage);

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
		console.log(err);
		res.status(400).send({
			success: false,
			error: "Error uploading bot image to IPFS",
		});
	}
});

module.exports = router;
