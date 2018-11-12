import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import next from 'next';
import dotenv from 'dotenv';
import cheerio from 'cheerio';
import rp from 'request-promise';
import Result from './models/Result';

dotenv.config();

const port = process.env.PORT || 8000;
const ROOT_URL = process.env.ROOT_URL || `http://localhost:${port}`;

// connect server to mongo db
const MONGO_URL = process.env.MONGO_URL_TEST;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};
mongoose.connect(
  MONGO_URL,
  options,
);

// next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(cors());
  server.use(bodyParser());

  // Routes

  server.post('/api/scrape', async (req, res, next) => {
    const { url } = req.body;

    // get result from cache if available

    const data = await Result.getFromCache(url);

    if (data) {
      console.log('SEND CACHED RESULT', data);
      res.json(data);
      return;
    }

    const options = {
      uri: url,
      transform: function(body) {
        return cheerio.load(body);
      },
    };

    let paragraphs = [];

    rp(options)
      .then(async $ => {
        $('p').each((i, elem) => {
          paragraphs[i] = $(elem).text();
        });

        // get text content between paragraphs
        const textContent = paragraphs.join(',');

        // get separate words
        const regex = /[a-zA-ZäöüÄÖÜß]+/gm;
        const words = textContent.match(regex);

        // create word map
        const wordCountMap = words.reduce((wordCount, word) => {
          const loweredWord = word.toLowerCase();
          if (wordCount[loweredWord]) {
            wordCount[loweredWord] = wordCount[loweredWord] + 1;
          } else {
            wordCount[loweredWord] = 1;
          }
          return wordCount;
        }, {});

        console.log(wordCountMap);

        // sort and limit by resultSize (default = 20)
        const resultSize = parseInt(req.query.resultSize);

        const sortedWords = Object.keys(wordCountMap)
          .sort((a, b) => {
            return wordCountMap[b] - wordCountMap[a];
          })
          .map(word => {
            return {
              word: word,
              frequency: wordCountMap[word],
            };
          })
          .splice(0, resultSize);

        console.log('write to cache', sortedWords);
        const cache = await Result.writeToCache({ url: url, data: sortedWords });
        res.json(sortedWords);
      })
      .catch(err => {
        const error = new Error('an error occured while scraping the page');
        error.httpStatusCode = 500;
        return next(error);
      });
  });

  server.get('*', (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on ${ROOT_URL}`); // eslint-disable-line no-console
  });
});
