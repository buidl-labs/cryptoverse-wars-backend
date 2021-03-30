module.exports = async function addChapter(Module, Chapter) {
	const modules = require("../data/modules");
	const chapters = require("../data/chapters");

	await Module.bulkCreate(modules);

	const modules_from_db = await Module.findAll({ order: [["number"]] });

	let m;
	let chapters_for_db = chapters.map((c) => {
		m = modules_from_db[c.module_num];
		return {
			number: c.number,
			name: c.name,
			ModuleId: m.id,
		};
	});
	let res = await Chapter.bulkCreate(chapters_for_db);
	return res;
	// for (chapter of chapters) {
	// 	m = modules_from_db[chapter.module_num];

	// 	c = await Chapter.bulkCreate({
	// 		number: chapter.number,
	// 		name: chapter.name,
	// 		ModuleId: m.id,
	// 	});
	// }
	// console.log();
};
