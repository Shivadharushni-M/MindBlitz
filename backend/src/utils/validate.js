export function sanitizeInput(str) {
	return String(str).trim().slice(0, 200);
}

export function normalizeMode(mode) {
	return mode === 'math' ? 'math' : 'normal';
}