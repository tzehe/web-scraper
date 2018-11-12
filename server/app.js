import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import mongoSessionStore from 'connect-mongo';
import mongoose from 'mongoose';
import next from 'next';
import dotenv from 'dotenv';
import cheerio from 'cheerio';
import rp from 'request-promise';

dotenv.config();

const port = process.env.PORT || 8000;
const ROOT_URL = process.env.ROOT_URL || `http://localhost:${port}`;

// connect server to mongo db
// const MONGO_URL = process.env.MONGO_URL_TEST;

// const options = {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// };
// mongoose.connect(
//   MONGO_URL,
//   options,
// );

// next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // is used to store the session in a db
  //   const MongoStore = mongoSessionStore(session);

  // configure session
  //   const sess = {
  //     name: 'builderbook.sid',
  //     secret: 'HD2w.)q*VqRT4/#NK2M/,E^B)}FED5fWU!dKe[wk',
  //     store: new MongoStore({
  //       mongooseConnection: mongoose.connection,
  //       ttl: 14 * 24 * 60 * 60, // save session 14 days
  //     }),
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       httpOnly: true,
  //       maxAge: 14 * 24 * 60 * 60 * 1000,
  //     },
  //   };

  // create a session
  //   server.use(session(sess));

  // server.get('/', async (req, res) => {
  //   // req.session.foo = 'bar';
  //   // const user = await User.findOne({ slug: 'team-builder-book' });
  //   app.render(req, res, '/');
  // });

  // Middleware
  server.use(cors());
  server.use(bodyParser());

  // Routes

  server.post('/api/scrape', (req, res, next) => {
    const { url } = req.body;

    const options = {
      uri: url,
      transform: function(body) {
        return cheerio.load(body);
      },
    };

    let paragraphs = [];

    rp(options)
      .then($ => {
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

        console.log(sortedWords);

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
