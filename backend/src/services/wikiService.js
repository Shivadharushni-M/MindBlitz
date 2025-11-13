const WIKI_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

export async function fetchTopicData(topic) {
	const encoded = encodeURIComponent(topic);
	const url = `${WIKI_BASE}${encoded}`;

	const resp = await fetch(url, {
		method: 'GET',
		headers: { 'User-Agent': 'SmartStudyAssistant/1.0 (https://example.com)' },
	});

	if (!resp.ok) {
		if (resp.status === 404) return { title: topic, extract: '', funFact: null };
		throw new Error(`Wikipedia fetch failed: ${resp.status}`);
	}

	const data = await resp.json();
	return {
		title: data?.title || topic,
		extract: data?.extract || data?.description || '',
		description: data?.description || '',
		thumbnail: data?.thumbnail?.source || null,
		contentUrls: data?.content_urls || null,
		funFact: buildFunFact(data),
	};
}

function buildFunFact(data) {
	const title = data?.title;
	const desc = data?.description;
	if (!title) return null;
	if (desc) return `Did you know? ${title} — ${desc}.`;
	return `Did you know? ${title} is a topic on Wikipedia.`;
}
