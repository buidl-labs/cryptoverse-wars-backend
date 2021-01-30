"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Chapter extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate({ Module, User }) {
			this.belongsTo(Module);
			this.belongsToMany(User, { through: "ChaptersCompleted" });
		}
	}
	Chapter.init(
		{
			name: {
				type: DataTypes.STRING,
			},
			number: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "Chapter",
			tableName: "chapter",
		}
	);
	return Chapter;
};
