const axios = require("axios");
const { bytes2Char } = require("@taquito/tzip16");

function buildApiUrl(big_map_ptr, network) {
	return `https://api.better-call.dev/v1/bigmap/${network}/${big_map_ptr}/keys`;
}

function sanitizeJsonUri(origin) {
	if (origin.startsWith("ipfs://")) {
		return `https://cloudflare-ipfs.com/ipfs/${origin.substring(7)}/`;
	}
	return null;
}

async function findCreatorByTokenId(token_id) {
	try {
		const response = await axios.get(buildApiUrl(60133, "edo2net"));
		const tokens = response.data;

		const token = tokens.find((token) => token.data.key.value == token_id);
		const metadataHash = bytes2Char(
			token.data.value.children[1].children[0].value
		);
		const metadataResp = await axios.get(sanitizeJsonUri(metadataHash));
		return metadataResp.data.creators[0];
	} catch (err) {
		console.log(err);
	}
}

module.exports = { findCreatorByTokenId };
