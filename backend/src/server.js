import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const server = app.listen(port, () => {
	console.log(`[Smart Study Assistant] Backend running on port ${port}`);
});

process.on('SIGINT', () => {
	server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
	server.close(() => process.exit(0));
});
