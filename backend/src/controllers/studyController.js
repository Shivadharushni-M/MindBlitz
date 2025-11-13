import { fetchTopicData } from '../services/wikiService.js';
import { generateAIContent } from '../services/aiService.js';
import { HttpError } from '../utils/httpError.js';
import { sanitizeInput, normalizeMode } from '../utils/validate.js';

export async function createStudyPack(req, res, next) {
	try {
		const rawTopic = req.body?.topic;
		const rawMode = req.body?.mode;

		if (!rawTopic || typeof rawTopic !== 'string' || !rawTopic.trim()) {
			throw new HttpError(400, 'Invalid or missing topic');
		}

		const topic = sanitizeInput(rawTopic);
		const mode = normalizeMode(rawMode);

		const wiki = await fetchTopicData(topic);
		if (!wiki?.extract) {
			throw new HttpError(404, 'Topic not found on Wikipedia');
		}

		const ai = await generateAIContent({ topic: wiki.title || topic, extract: wiki.extract, mode });

		const summary = Array.isArray(ai.summary) && ai.summary.length
			? ai.summary.slice(0, 3)
			: buildFallbackSummary(wiki.extract);

		const studyTip = ai.studyTip || buildFallbackStudyTip(wiki.title || topic);

		let quiz = Array.isArray(ai.quiz) ? ai.quiz.slice(0, 3) : [];

		if (quiz.length === 0) {
			quiz = buildFallbackQuiz(wiki.title || topic, summary);
		}

		let mathQuestion = null;
		if (mode === 'math') {
			if (ai.math) {
				mathQuestion = ai.math;
			} else {
				mathQuestion = buildFallbackMathQuestion(wiki.title || topic, summary);
			}
		}

		const payload = {
			topic: wiki.title || topic,
			summary,
			quiz,
			math: mathQuestion,
			studyTip,
			funFact: ai.funFact || wiki.funFact || null,
			mode,
			timestamp: new Date().toISOString(),
			source: {
				wikipedia: wiki.contentUrls?.desktop?.page || null,
			},
		};

		res.status(200).json(payload);
	} catch (err) {
		next(err);
	}
}

function buildFallbackSummary(extract) {
	if (!extract) return [];
	return String(extract)
		.split(/(?<=[.!?])\s+/)
		.filter(Boolean)
		.map((s) => s.trim())
		.slice(0, 3);
}

function buildFallbackStudyTip(title) {
	const t = title || 'this topic';
	const tips = [
		'Try the Feynman Technique: Explain ' + t + ' to someone as if they are 10 years old. Gaps in your explanation reveal what you need to review.',
		'Create a mind map: Put ' + t + ' in the center and branch out with key concepts, examples, and connections you discovered.',
		'Use active recall: Close this summary and write down everything you remember about ' + t + '. Check what you missed, then repeat.',
		'Make flashcards for the 3-5 most important terms in ' + t + '. Review them using spaced repetition (today, tomorrow, in 3 days, in a week).',
		'Teach it back: Record a 2-minute voice memo explaining ' + t + ' in your own words. Listen back to identify unclear areas.',
		'Find real-world connections: Spend 5 minutes thinking about how ' + t + ' applies to your life or current events.',
		'Draw it out: Create a visual diagram or timeline for ' + t + '. Visual representations often reveal patterns text alone cannot.',
		'Practice retrieval: Cover the summary and quiz yourself on ' + t + ' without looking. Struggling to remember actually strengthens memory.'
	];
	return tips[Date.now() % tips.length];
}

function buildFallbackQuiz(topic, summary) {
	const questions = [];

	if (Array.isArray(summary) && summary.length > 0) {
		summary.slice(0, 3).forEach((s, i) => {
			const shortSummary = s.slice(0, 100);

			if (i === 0) {
				questions.push({
					q: 'Based on this key concept about ' + topic + ': ' + shortSummary + '... - Which statement best explains WHY this is significant?',
					options: [
						'It reveals the fundamental mechanism behind how ' + topic + ' functions',
						'It is just a basic fact without deeper implications',
						'It only matters for memorization purposes',
						'It is purely historical context'
					],
					answer: 'It reveals the fundamental mechanism behind how ' + topic + ' functions',
				});
			} else if (i === 1) {
				questions.push({
					q: 'Regarding ' + topic + ': ' + shortSummary + '... - What would happen if this principle were disrupted?',
					options: [
						'The core functionality of ' + topic + ' would be compromised',
						'Nothing significant would change',
						'Only aesthetic differences would occur',
						'It would work identically'
					],
					answer: 'The core functionality of ' + topic + ' would be compromised',
				});
			} else {
				questions.push({
					q: 'To demonstrate true understanding of ' + topic + ' beyond memorization, you should be able to:',
					options: [
						'Apply these concepts: ' + shortSummary.slice(0, 50) + '... to solve new problems',
						'Only recite the definition verbatim',
						'Know the year it was discovered',
						'List facts without understanding connections'
					],
					answer: 'Apply these concepts: ' + shortSummary.slice(0, 50) + '... to solve new problems',
				});
			}
		});
	}

	const lastResortQuestions = [
		{
			q: 'When studying ' + topic + ', which approach demonstrates the deepest level of understanding?',
			options: [
				'Being able to explain ' + topic + ' concepts and apply them to solve new problems',
				'Memorizing definitions and terms related to ' + topic,
				'Knowing historical dates about ' + topic,
				'Reading about ' + topic + ' once without practice'
			],
			answer: 'Being able to explain ' + topic + ' concepts and apply them to solve new problems',
		},
		{
			q: 'What would be the most effective way to verify someone truly understands ' + topic + '?',
			options: [
				'Ask them to solve a problem involving ' + topic + ' they have not seen before',
				'Have them recite the definition of ' + topic,
				'Check if they can spell terms from ' + topic,
				'See if they remember who discovered ' + topic
			],
			answer: 'Ask them to solve a problem involving ' + topic + ' they have not seen before',
		},
		{
			q: 'In a real-world scenario requiring knowledge of ' + topic + ', what skill would be most valuable?',
			options: [
				'The ability to apply ' + topic + ' principles to analyze and solve the problem',
				'Knowing the textbook definition of ' + topic,
				'Remembering facts about ' + topic + ' without context',
				'Having memorized examples from ' + topic + ' lessons'
			],
			answer: 'The ability to apply ' + topic + ' principles to analyze and solve the problem',
		},
	];

	while (questions.length < 3) {
		questions.push(lastResortQuestions[questions.length]);
	}

	return questions.slice(0, 3);
}

function buildFallbackMathQuestion(topic, summary) {
	const seed = Date.now();
	const num1 = 30 + (seed % 70);
	const num2 = 10 + (seed % 40);
	const percentage = 10 + (seed % 40);

	const problems = [
		{
			question: 'If a student studies ' + topic + ' for ' + num1 + ' minutes on day 1, then increases their study time by ' + percentage + '% each day, how many minutes will they study on day 3?',
			answer: (num1 * Math.pow(1 + percentage/100, 2)).toFixed(1) + ' minutes',
			explanation: 'Day 1: ' + num1 + ' min. Day 2: ' + num1 + ' × ' + (1 + percentage/100) + ' = ' + (num1 * (1 + percentage/100)).toFixed(1) + ' min. Day 3: ' + (num1 * (1 + percentage/100)).toFixed(1) + ' × ' + (1 + percentage/100) + ' = ' + (num1 * Math.pow(1 + percentage/100, 2)).toFixed(1) + ' min'
		},
		{
			question: 'In a ' + topic + ' test, ' + num1 + ' questions were asked. If a student answered ' + percentage + '% correctly, how many did they get wrong?',
			answer: Math.floor(num1 * (1 - percentage/100)) + ' questions',
			explanation: 'Correct: ' + num1 + ' × ' + percentage/100 + ' = ' + Math.floor(num1 * percentage/100) + '. Wrong: ' + num1 + ' - ' + Math.floor(num1 * percentage/100) + ' = ' + Math.floor(num1 * (1 - percentage/100))
		},
		{
			question: 'A ' + topic + ' textbook has ' + (num1 * 3) + ' pages. If you read ' + num2 + ' pages per day, how many complete days to finish?',
			answer: Math.ceil((num1 * 3) / num2) + ' days',
			explanation: 'Total pages ÷ pages per day = ' + (num1 * 3) + ' ÷ ' + num2 + ' = ' + ((num1 * 3) / num2).toFixed(2) + ', rounded up to ' + Math.ceil((num1 * 3) / num2) + ' days'
		}
	];

	return problems[seed % problems.length];
}
