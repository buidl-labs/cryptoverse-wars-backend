"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Cryptobot extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate({ User }) {
			this.belongsTo(User);
		}
	}

	Cryptobot.init(
		{
			token_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			imageURI: {
				type: DataTypes.STRING,
				// allowNull: false,
				unique: true,
			},
		},
		{
			sequelize,
			modelName: "Cryptobot",
			tableName: "cryptobot",
		}
	);
	return Cryptobot;
};
