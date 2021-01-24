const express = require("express");
const router = express.Router();
const magic = require("../magic");
const { User, Chapter, Module } = require("../models");

router.get("/", async (req, res) => {
	const { uuid, xtz } = req.query;
	console.log(uuid, xtz);

	try {
		const param = uuid ? { uuid } : { xtzAddress: xtz };

		const user = await User.findOne({ where: param });

		if (!user) {
			throw new Error();
		}

		res.json(user);
	} catch {
		res.status(404).json({ error: "USER_NOT_FOUND" });
	}
});

router.post("/", async (req, res) => {
	const { xtzAddress } = req.body;

	try {
		let user = await User.findOne({ where: { xtzAddress } });

		if (!user) user = await User.create({ xtzAddress });

		return res.json(user);
	} catch (err) {
		return res.status(500).json(err.toString());
	}
});

router.patch("/", async (req, res) => {
	const { user: user_in_req, email } = req.body;

	try {
		const u = await User.findOne({ where: { email } });
		if (u) {
			throw new Error("EMAIL_ALREADY_USED");
		}
		try {
			const user = await User.findOne({
				where: {
					uuid: user_in_req.uuid,
					xtzAddress: user_in_req.xtzAddress,
				},
			});

			if (!user) {
				throw new Error("USER_NOT_FOUND");
			}

			user.email = email;

			await user.save();
			console.log("user saved.");
			res.json(user);
		} catch (err) {
			res.status(404).json({ error: err.message });
		}
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.post("/verify", async (req, res) => {
	const { token } = req.body;
	try {
		const { email } = await magic.users.getMetadataByToken(token);
		try {
			const user = await User.findOne({ where: { email } });
			if (!user) {
				throw new Error("USER_NOT_FOUND");
			}
			user.verified = true;
			await user.save();
			return res.json(user);
		} catch (err) {
			res.status(404).json({ error: err.message });
			return;
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post("/progress", async (req, res) => {
	const { user: user_req, module_num, chapter_num } = req.body;

	try {
		let user = await User.findOne({
			where: { uuid: user_req.uuid, xtzAddress: user_req.xtzAddress },
		});
		if (!user) {
			throw new Error("USER_NOT_FOUND");
		}

		const mod = await Module.findOne({
			where: { number: module_num },
		});

		const chapter = await Chapter.findOne({
			where: { ModuleId: mod.id, number: chapter_num },
		});

		if (!chapter) {
			throw new Error("CHAPTER_NOT_FOUND");
		}

		await user.addChapter(chapter);

		user = await User.findOne({
			where: { uuid: user_req.uuid, xtzAddress: user_req.xtzAddress },
			include: "Chapters",
		});

		return res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
