const { Magic } = require("@magic-sdk/admin");

require("dotenv").config();

const magic = new Magic(process.env.MAGIC_SK);
const magic = new Magic("sk_test_D247CB3A8247F971");

module.exports = magic;
