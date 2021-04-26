const express = require("express");
const router = express.Router();
const magic = require("../magic");
const { User, Chapter, Module } = require("../models");
const { Op } = require("sequelize");

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
	const { user: user_in_req, email, name } = req.body;
	console.log(user_in_req, email, name);

	try {
		let u = await User.findOne({
			where: { [Op.or]: [{ email }, { name }] },
		});

		if (u && user_in_req.xtzAddress !== u.xtzAddress) {
			const err = u.email == email ? "EMAIL" : "NAME";

			throw new Error(`${err}_ALREADY_USED`);
		}
		try {
			// console.log("user_in_req", user_in_req);

			const user = await User.findOne({
				where: {
					uuid: user_in_req.uuid,
					xtzAddress: user_in_req.xtzAddress,
				},
			});
			// console.log("user", user);

			if (!user) {
				throw new Error("USER_NOT_FOUND");
			}

			user.email = email;
			user.name = name;

			await user.save();

			// console.log("user saved.");

			res.json(user);
		} catch (err) {
			res.status(404).json({ error: err.message });
		}
	} catch (err) {
		res.json({ error: err.message });
	}
});

router.post("/verify", async (req, res) => {
	const { token } = req.body;
	console.log(token);
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
		console.log(err.message);
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
		if (!user.verified) {
			throw new Error("USER_NOT_VERIFIED");
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

router.post("/progress/batch", async (req, res) => {
	// {
	// 	"module-0": {
	// 		"chapter-02": true,
	// 		"chapter-03": true,
	// 		"chapter-04": true,
	// 		"chapter-01": true,
	// 		"chapter-05": true
	// 	},
	// 	"module-01": {
	// 		"chapter-04": true
	// 	},
	// 	"module-04": {
	// 		"chapter-09": true,
	// 		"chapter-06": true,
	// 		"chapter-07": true
	// 	}
	// }

	/*
		Steps:
			1. Find user.
			2. Add Chapters to user object.
	*/
	const { user: user_req, progress } = req.body;

	try {
		let user = await User.findOne({
			where: { uuid: user_req.uuid, xtzAddress: user_req.xtzAddress },
			include: "Chapters",
		});

		if (!user) {
			throw new Error("USER_NOT_FOUND");
		}

		if (!user.verified) {
			throw new Error("USER_NOT_VERIFIED");
		}

		let chapters = [];
		for (module of Object.keys(progress)) {
			let mod = await Module.findOne({
				where: { number: parseInt(module.split("-")[1]) },
			});
			chapters.push(
				...(await Chapter.findAll({
					where: {
						[Op.and]: [
							{
								number: Object.keys(progress[module]).map((c) =>
									parseInt(c.split("-")[1])
								),
								ModuleId: mod.id,
							},
						],
					},
				}))
			);
		}

		await user.addChapters(chapters);
		res.json(user);
	} catch (err) {
		res.json(err.message);
	}
});

module.exports = router;
