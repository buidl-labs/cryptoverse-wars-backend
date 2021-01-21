const express = require('express');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Readable } = require('stream');
const axios = require('axios');
const { sequelize } = require('./models')

//Environment variables
const config = require('config');

// let PINATA_API_KEY = config.get('PINATA_API_KEY');
// let PINATA_SECRET_API_KEY = config.get('PINATA_SECRET_API_KEY');

// if (!config.get('PINATA_API_KEY')) {
//   throw new Error('Pinata api key must have a value!');
// }

// if (!config.get('PINATA_SECRET_API_KEY')) {
//   throw new Error('Pinata secret api key must have a value!');
// }

const app = express();
const port = process.env.PORT || 3001;

//3d model compression lib
const gltfPipeline = require('gltf-pipeline');
const processGlb = gltfPipeline.processGlb;

const glbCompressionOptions = {
  dracoOptions: {
    compressionLevel: 10,
  },
};

// middlewares

app.use(cors());

app.use(fileUpload());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.post('/api/upload-3d-model-to-ipfs', async (req, res) => {
//   //   console.log(req.body);
//   //   console.log(req.files.file.data);

//   // Compress 3d model
//   const bot = await processGlb(req.files.file.data, glbCompressionOptions);

//   // Convert buffer into readable stream
//   const buffer = Buffer.from(bot.glb, 'binary');
//   const readable = new Readable();
//   readable._read = () => {}; // _read is required but you can noop it
//   readable.push(buffer);
//   readable.push(null);

//   const form = new FormData();
//   form.append('file', readable, {
//     filename: 'custom.glb', //required or it fails
//   });

//   const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

//   var config = {
//     method: 'post',
//     url: url,
//     maxBodyLength: Infinity,
//     headers: {
//       pinata_api_key: PINATA_API_KEY,
//       pinata_secret_api_key: PINATA_SECRET_API_KEY,
//       ...form.getHeaders(),
//     },
//     data: form,
//   };

//   try {
//     const output = await axios(config);

//     res.send({
//       success: true,
//       body: {
//         ipfsHash: output.data.IpfsHash,
//         timestamp: output.data.Timestamp,
//       },
//     });
//   } catch (err) {
//     res.status(400).send({
//       success: false,
//       error: 'Error uploading custom 3D Model to IPFS',
//     });
//   }
// });
 
const userRoutes = require('./routes/User');
app.use('/user', userRoutes);

app.get('/', (req, res) => res.send('Hello from cryptoverse wars!'));


app.listen(port, async () => {
  console.log(`Listening on port ${port}!`)
  await sequelize.authenticate()
})


