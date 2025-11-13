import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import studyRouter from './routes/study.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.ORIGIN || '*')
	.split(',')
	.map((o) => o.trim());

app.use(helmet());
app.use(
	cors({
		origin: allowedOrigins.includes('*') ? true : allowedOrigins,
	})
);
app.use(express.json({ limit: '1mb' }));
app.use(compression());

app.get('/api/health', (_req, res) => {
	res.json({ ok: true, service: 'smart-study-assistant', time: new Date().toISOString() });
});

app.use('/api/study', studyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

