module.exports = async function addChapter(Module, Chapter) {
	const modules = require("../data/modules");
	const chapters = require("../data/chapters");
	console.log(modules);
	for (module of modules) {
		await Module.create(module);
	}

	const modules_from_db = await Module.findAll({ order: [["number"]] });

	let m;

	for (chapter of chapters) {
		m = modules_from_db[chapter.module_num];
		console.log(m.id);
		await Chapter.create({
			number: chapter.number,
			name: chapter.name,
			ModuleId: m.id,
		});
	}
	return true;
};
