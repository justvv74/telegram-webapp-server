// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const TelegramBot = require('node-telegram-bot-api');
// const requester = require('node-fetch');
// const cors = require('cors');

// const knex = require('knex')({
//   client: 'pg',
//   connection: {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 5432,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//   },
// });

// const app = express();
// const botToken = process.env.BOT_TOKEN || '';
// const bot = new TelegramBot(botToken, { polling: true });

// const corsOptions = {
//   origin: `${process.env.ACAO}`,
//   // credentials: true,
// };

// app.use(cors(corsOptions));

// app.all('*', function (req, res, next) {
//   res.header(
//     'Access-Control-Allow-Origin',
//     'https://telegram-webapp-client.vercel.app'
//   );
//   res.header('Vary', 'Origin');
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

// async function getPhotosListByTagName(userId) {
//   return await knex('saved_image')
//     .select()
//     .where({ sender_tg_id: userId })
//     .then((res) => {
//       return res;
//     });
// }

// async function getBlobFromImage(url) {
//   const { Blob } = require('buffer');
//   const result = await requester(url)
//     .then((res) => {
//       return res.buffer();
//     })
//     .then((res) => {
//       return new Blob([res], { type: 'image/png' });
//     })
//     .catch((err) => {
//       return err;
//     });

//   return result;
// }

// app.post(
//   '/search',
//   bodyParser.urlencoded({ extended: false }),
//   async (req, res) => {
//     try {
//       const { userId, tag } = req.body;
//       const photosList = await getPhotosListByTagName(userId);
//       const filtredList = photosList.filter((item) =>
//         String(item.tag).toLowerCase().includes(tag.toLowerCase())
//       );
//       console.log(userId, tag);
//       await Promise.all(
//         await filtredList.map(async (item) => {
//           return (await bot.getFile(item.image_id)).file_path;
//         })
//       )
//         .then((response) => {
//           res
//             .header(
//               'Access-Control-Allow-Origin',
//               'https://telegram-webapp-client.vercel.app'
//             )
//             .header('Vary', 'Origin')
//             .status(200)
//             .send({ botId: botToken, photosList: response });
//         })
//         .catch((err) => res.status(404).send(String(err)));
//     } catch (err) {
//       res.status(400).send(err.message);
//     }
//   }
// );

// app.post(
//   '/photo',
//   bodyParser.urlencoded({ extended: false }),
//   async (req, res) => {
//     try {
//       const url = req.body.url;
//       const blob = await getBlobFromImage(url);

//       if (blob.constructor.name === 'Blob') {
//         res.status(201).type(blob.type);
//         blob.arrayBuffer().then((buf) => {
//           res.send(Buffer.from(buf));
//         });
//       } else {
//         res.sendStatus(400);
//       }
//     } catch (err) {
//       res.status(400).send(err.message);
//     }
//   }
// );

// app.get('/test', async (req, res) => {
//   try {
//     res.header('Access-Control-Allow-Origin', '*').status(200).send('test: ok');
//   } catch (err) {
//     res.status(400).send(String(err));
//   }
// });

// app.use((err, req, res, next) => {
//   res.status(500).send(String(err.message));

//   next();
// });

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`  Listening on http://localhost:${port}`);
// });

// export {};

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Home Page Route'));
app.get('/about', (req, res) => res.send('About Page Route'));
app.get('/portfolio', (req, res) => res.send('Portfolio Page Route'));
app.get('/contact', (req, res) => res.send('Contact Page Route'));
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server running on ${port}, http://localhost:${port}`)
);
