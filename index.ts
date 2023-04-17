require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const requester = require('node-fetch');
const cors = require('cors');

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
});

const app = express();
const botToken = process.env.BOT_TOKEN || '';
const bot = new TelegramBot(botToken, { polling: true });

const corsOptions = {
  origin: `${process.env.ACAO}`,
};

app.use(cors(corsOptions));

interface IGlobHeaderRes {
  header: (a: string, b: string) => void;
}

app.all('*', (req: any, res: IGlobHeaderRes, next: any) => {
  res.header('Access-Control-Allow-Origin', `${process.env.ACAO}`);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

async function getPhotosListByTagName(userId: string) {
  return await knex('saved_image')
    .select()
    .where({ sender_tg_id: userId })
    .then((res: { tag: string }) => {
      return res;
    });
}

async function getBlobFromImage(url: string) {
  const { Blob } = require('buffer');
  const result = await requester(url)
    .then((res: any) => {
      return res.buffer();
    })
    .then((res: any) => {
      return new Blob([res], { type: 'image/png' });
    })
    .catch((err: any) => {
      return err;
    });

  return result;
}

interface ISearchReq {
  body: {
    tag: string;
    userId: string;
  };
}

interface ISearchRes {
  status: (e: number) => {
    send: (
      e?:
        | {
            botId?: string;
            photosList?: string[];
          }
        | string
    ) => void;
  };
}

app.post(
  '/search',
  bodyParser.urlencoded({ extended: false }),
  async (req: ISearchReq, res: ISearchRes) => {
    try {
      const { userId, tag } = req.body;
      const photosList = await getPhotosListByTagName(userId);
      const filtredList = photosList.filter((item: { tag: string }) =>
        String(item.tag).toLowerCase().includes(tag.toLowerCase())
      );
      console.log(userId, tag);
      await Promise.all(
        await filtredList.map(async (item: { image_id: string }) => {
          return (await bot.getFile(item.image_id)).file_path;
        })
      )
        .then((response) => {
          res.status(200).send({ botId: botToken, photosList: response });
        })
        .catch((err) => res.status(404).send(String(err)));
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  }
);

interface IPhotoReq {
  body: {
    url: string;
  };
}

interface IPhotoRes {
  status: (e: number) => {
    type: (e: IBlob) => {};
    send: (e: string) => void;
  };
  send: (e: Buffer) => void;
  sendStatus: (e: number) => void;
}

interface IBlob extends Blob {
  type: 'image/png';
}

app.post(
  '/photo',
  bodyParser.urlencoded({ extended: false }),
  async (req: IPhotoReq, res: IPhotoRes) => {
    try {
      const url = req.body.url;
      const blob = await getBlobFromImage(url);

      if (blob.constructor.name === 'Blob') {
        res.status(201).type(blob.type);
        blob.arrayBuffer().then((buf: any) => {
          res.send(Buffer.from(buf));
        });
      } else {
        res.sendStatus(400);
      }
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  }
);

interface IUseGlobErrorRes {
  status: (e: number) => {
    send: (e: string) => void;
  };
}

app.use((err: any, req: any, res: IUseGlobErrorRes, next: any) => {
  res.status(500).send(String(err.message));

  next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});

export {};
