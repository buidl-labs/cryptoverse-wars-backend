"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate({ Chapter, Cryptobot }) {
			this.belongsToMany(Chapter, {
				through: "ChaptersCompleted",
				as: "Chapters",
			});

			this.hasMany(Cryptobot);
		}

		toJSON() {
			return { ...this.get(), id: undefined };
		}
	}
	User.init(
		{
			uuid: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
			},
			name: {
				type: DataTypes.STRING,
				unique: true,
			},
			xtzAddress: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			verified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: "User",
			tableName: "users",
		}
	);
	return User;
};
