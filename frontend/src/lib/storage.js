const HISTORY_KEY = 'ssa_history';
const THEME_KEY = 'ssa_theme';

export function getHistory() {
	try {
		const raw = localStorage.getItem(HISTORY_KEY);
		const parsed = JSON.parse(raw || '[]');
		return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
	} catch {
		return [];
	}
}

export function addToHistory(topic) {
	const current = getHistory().filter((t) => t.toLowerCase() !== topic.toLowerCase());
	const next = [topic, ...current].slice(0, 10);
	localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
	return next;
}

export function getTheme() {
	return localStorage.getItem(THEME_KEY) || 'light';
}

export function setTheme(theme) {
	localStorage.setItem(THEME_KEY, theme);
}

