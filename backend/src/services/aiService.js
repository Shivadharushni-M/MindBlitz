const API_VERSION = process.env.GEMINI_API_VERSION || 'v1';
const GEMINI_BASE = `https://generativelanguage.googleapis.com/${API_VERSION}/models`;

export async function generateAIContent({ topic, extract, mode }) {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
		console.error('❌ GEMINI_API_KEY is missing, empty, or still placeholder - cannot generate AI content');
		return { summary: [], quiz: [], math: null, studyTip: '', funFact: '' };
	}

	const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
	const system = mode === 'math'
		? 'You are a helpful math tutor. Always respond with valid JSON only, no markdown or code blocks.'
		: 'You are a helpful study assistant. Always respond with valid JSON only, no markdown or code blocks.';

	const userPrompt = buildPrompt({ topic, extract, mode });

	const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

	const body = {
		contents: [{ parts: [{ text: system + '\n\n' + userPrompt }] }],
		generationConfig: {
			temperature: mode === 'math' ? 0.3 : 0.4,
		},
	};

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 20000);

		const resp = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: controller.signal
		});

		clearTimeout(timeoutId);

		if (!resp.ok) {
			const errorText = await resp.text();
			console.error(`❌ Gemini API error (${resp.status}):`, errorText);

			if (resp.status === 400) {
				console.error('💡 Tip: This might be due to invalid API key or malformed request');
				console.error('🔧 Check: Is your GEMINI_API_KEY valid and properly formatted?');
			} else if (resp.status === 401 || resp.status === 403) {
				console.error('🔑 API key authentication failed. Please check your GEMINI_API_KEY in .env file');
				console.error('🔧 Check: Did you replace the placeholder API key with a real one from Google AI Studio?');
			} else if (resp.status === 429) {
				console.error('⚠️ Rate limit exceeded. Please try again later');
			} else if (resp.status >= 500) {
				console.error('🔧 Server error - Gemini API might be temporarily unavailable');
			}

			return { summary: [], quiz: [], math: null, studyTip: '', funFact: '' };
		}

		const data = await resp.json();

		if (!data || !data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
			console.error('❌ Invalid Gemini API response structure:', data);
			return { summary: [], quiz: [], math: null, studyTip: '', funFact: '' };
		}

		const parts = data.candidates[0]?.content?.parts || [];
		const content = parts.map((p) => p?.text || '').join('\n');

		const parsed = robustParseJson(content);

		if (!parsed || typeof parsed !== 'object') {
			console.error('❌ Failed to parse JSON from Gemini API response!');
			console.error('Raw content preview:', content.substring(0, 300));
			console.error('🔧 This usually means Gemini returned malformed JSON or non-JSON content');
			return { summary: [], quiz: [], math: null, studyTip: '', funFact: '' };
		}

		const requiredFields = ['summary', 'quiz', 'studyTip', 'funFact'];
		const missingFields = requiredFields.filter(field => !(field in parsed));

		if (missingFields.length > 0) {
			console.warn(`⚠️ Missing fields in Gemini response: ${missingFields.join(', ')}`);
		}

		const result = {
			summary: Array.isArray(parsed?.summary) ? parsed.summary.slice(0, 3) : [],
			quiz: Array.isArray(parsed?.quiz) ? parsed.quiz.slice(0, 3) : [],
			math: parsed?.math || null,
			studyTip: parsed?.studyTip || '',
			funFact: parsed?.funFact || '',
		};

		return result;
	} catch (err) {
		if (err.name === 'AbortError') {
			console.error('⏱️ Gemini API timeout after 20 seconds - using fallback content');
		} else {
			console.error('❌ Error generating AI content:', err.message);
		}
		return { summary: [], quiz: [], math: null, studyTip: '', funFact: '' };
	}
}

function buildPrompt({ topic, extract, mode }) {
	const isMathTopic = /math|calculus|algebra|geometry|trigonometry|statistics|probability|equation|theorem|formula|arithmetic/i.test(topic);

	if (mode === 'math') {
		return [
			`Topic: ${topic}`,
			`Context: ${truncate(extract, 1200)}`,
			`Task: Create a comprehensive study pack with quiz AND math problem.`,
			`Requirements:`,
			`- Summary: 3 DETAILED bullets explaining key concepts (not just definitions)`,
			`- Quiz: Generate EXACTLY 3 competitive questions DIRECTLY ABOUT ${topic} using the context provided`,
			`  * Make them RELATABLE and SPECIFIC to ${topic} - use real examples, applications, or scenarios from the topic`,
			`  * Q1 (Medium): Test a key concept or mechanism specific to ${topic}`,
			`  * Q2 (Hard): Test how ${topic} works in a specific real-world scenario or application`,
			`  * Q3 (Very Hard): Test edge cases, limitations, or advanced concepts about ${topic}`,
			`  * Use actual terminology, processes, and examples FROM ${topic}`,
			`  * Make options specific to ${topic} - not generic statements`,
			`  * Questions must be directly answerable using knowledge of ${topic}`,
			`- Math: ONE ${isMathTopic ? 'pure mathematical problem using formulas/equations from this topic' : 'quantitative word problem'} with RANDOM UNIQUE numbers`,
			`  * MUST use DIFFERENT random numbers each time (vary the values significantly)`,
			`  * ${isMathTopic ? 'Use actual formulas/theorems from the topic (e.g., for Pythagorean: "Find c if a=7, b=24")' : 'Create a practical word problem with calculations'}`,
			`  * Show complete step-by-step solution`,
			`- StudyTip: Specific technique for mastering ${topic}`,
			`- FunFact: ONE surprising, interesting, or counterintuitive fact about ${topic} (make it genuinely fascinating)`,
			`Return JSON exactly in this shape:`,
			`{ "summary": ["detailed bullet 1", "detailed bullet 2", "detailed bullet 3"], "quiz": [{"q":"Why would [scenario X] lead to [outcome Y] rather than [outcome Z]?", "options":["Plausible A","Plausible B","Plausible C","Plausible D"], "answer":"Plausible A"}, {"q":"If [condition] changed, what would be the FIRST consequence?", "options":["Detailed option 1","Detailed option 2","Detailed option 3","Detailed option 4"], "answer":"Detailed option 2"}, {"q":"Which factor has the MOST impact on [complex situation]?", "options":["Option A with reasoning","Option B with reasoning","Option C with reasoning","Option D with reasoning"], "answer":"Option A with reasoning"}], "math": {"question":"...", "answer":"...", "explanation":"..."}, "studyTip":"...", "funFact":"..." }`,
			`- No markdown or code fences.`,
		].join('\n');
	}

	return [
		`Topic: ${topic}`,
		`Context: ${truncate(extract, 1200)}`,
		`Task: Create a comprehensive study pack.`,
		`Requirements:`,
		`- Summary: EXACTLY 3 DETAILED explanatory bullets (not basic definitions, explain HOW/WHY things work)`,
		`- Quiz: Generate EXACTLY 3 competitive questions DIRECTLY ABOUT ${topic} using the context provided`,
		`  * Make them RELATABLE and SPECIFIC to ${topic} - use real-world examples and applications`,
		`  * Q1 (Medium): Test a core concept or process specific to ${topic}`,
		`  * Q2 (Hard): Test application of ${topic} in a real-world scenario`,
		`  * Q3 (Very Hard): Test edge cases, advanced concepts, or implications of ${topic}`,
		`  * Use actual facts, terminology, and details FROM ${topic}`,
		`  * Options must be specific to ${topic} - not generic or vague`,
		`  * Questions should be directly relatable to someone learning ${topic}`,
		`  * Make all 4 options plausible using actual concepts from ${topic}`,
		`  * "answer" must match one option exactly`,
		`- StudyTip: ONE specific, actionable technique for learning ${topic}`,
		`- FunFact: ONE genuinely surprising or counterintuitive fact about ${topic} that makes people say "wow!"`,
		`Return JSON exactly in this shape:`,
		`{ "summary": ["detailed bullet 1", "detailed bullet 2", "detailed bullet 3"], "quiz": [{"q":"Why does [mechanism A] result in [effect B] instead of [alternative C]?", "options":["Detailed reasoning 1","Detailed reasoning 2","Detailed reasoning 3","Detailed reasoning 4"], "answer":"Detailed reasoning 1"}, {"q":"If [specific condition] occurred, which outcome would happen FIRST?", "options":["Plausible consequence A","Plausible consequence B","Plausible consequence C","Plausible consequence D"], "answer":"Plausible consequence B"}, {"q":"In [complex scenario], which factor would have the GREATEST impact?", "options":["Factor A with explanation","Factor B with explanation","Factor C with explanation","Factor D with explanation"], "answer":"Factor A with explanation"}], "studyTip":"...", "funFact":"..." }`,
		`- No markdown or code fences.`,
	].join('\n');
}

function truncate(text, max) {
	if (!text) return '';
	return text.length > max ? text.slice(0, max) + '...' : text;
}

function robustParseJson(str) {
	const cleaned = stripCodeFences(String(str || '').trim());
	const direct = tryJsonParse(cleaned);
	if (direct) return direct;
	const extracted = extractBalancedJson(cleaned);
	return extracted || {};
}

function stripCodeFences(text) {
	const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
	const match = text.match(fence);
	if (match) {
		return match[1].trim();
	}
	return text;
}

function tryJsonParse(text) {
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

function extractBalancedJson(text) {
	const starts = ['{', '['];
	for (const start of starts) {
		const end = start === '{' ? '}' : ']';
		const startIdx = text.indexOf(start);
		if (startIdx === -1) continue;
		let depth = 0;
		for (let i = startIdx; i < text.length; i++) {
			const ch = text[i];
			if (ch === start) depth++;
			else if (ch === end) depth--;
			if (depth === 0) {
				const candidate = text.slice(startIdx, i + 1);
				const parsed = tryJsonParse(candidate);
				if (parsed) return parsed;
				break;
			}
		}
	}
	return null;
}