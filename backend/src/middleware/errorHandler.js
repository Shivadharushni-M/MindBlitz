import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(_req, _res, next) {
	next(new HttpError(404, 'Route not found'));
}

export function errorHandler(err, _req, res, _next) {
	const status = err?.status || 500;
	const message = err?.message || 'Internal server error';
	if (process.env.NODE_ENV !== 'test') {
		console.error('[Error]', status, message);
	}
	res.status(status).json({
		error: { message, status },
		timestamp: new Date().toISOString(),
	});
}

