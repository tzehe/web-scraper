import express from 'express';
import session from 'express-session';
import mongoSessionStore from 'connect-mongo';
import mongoose from 'mongoose';
import next from 'next';
import dotenv from 'dotenv';
import User from './models/User';

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

  server.get('/', async (req, res) => {
    // req.session.foo = 'bar';
    // const user = await User.findOne({ slug: 'team-builder-book' });
    app.render(req, res, '/', { user });
  });

  server.get('*', (req, res) => handle(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on ${ROOT_URL}`); // eslint-disable-line no-console
  });
});
