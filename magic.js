const { Magic } = require("@magic-sdk/admin");

require("dotenv").config();

const magic = new Magic(process.env.MAGIC_SK);

module.exports = magic;
