import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { loadPlugins } from './plugin-loader';
import searchRoute from './routes/search';
import loadRoute from './routes/load';
import linksRoute from './routes/links';

const app = express();
app.use(helmet());
app.use(cors({
  origin: '*'  // for testing, allow all. Later you can restrict to your frontend URL
}));
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000), max: Number(process.env.RATE_LIMIT_MAX || 60) });
app.use(limiter);

// load plugins into memory
(async () => {
  await loadPlugins();
})();

app.use('/api/search', searchRoute);
app.use('/api/load', loadRoute);
app.use('/api/links', linksRoute);

app.get('/', (req, res) => res.send({ status: 'ok', pluginsLoaded: Object.keys(require('./plugin-loader').plugins || {}) }));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`backend listening on :${port}`));
