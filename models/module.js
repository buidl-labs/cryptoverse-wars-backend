"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Module extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate({ Chapter }) {
			this.hasMany(Chapter);
		}
	}
	Module.init(
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
			modelName: "Module",
			tableName: "module",
		}
	);
	return Module;
};
