export class HttpError extends Error {
	constructor(status = 500, message = 'Server error') {
		super(message);
		this.status = status;
	}
}