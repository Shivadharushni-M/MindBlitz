import request from 'supertest';
import { jest } from '@jest/globals';

// Mock AI generation to avoid calling Gemini API in tests
jest.unstable_mockModule('../src/services/aiService.js', () => ({
	generateAIContent: async ({ mode }) => {
		if (mode === 'math') {
			return {
				summary: ['s1', 's2', 's3'],
				quiz: [],
				math: { question: '2+2=?', answer: '4', explanation: 'Basic addition' },
				studyTip: 'Practice daily.',
			};
		}
		return {
			summary: ['s1', 's2', 's3'],
			quiz: [
				{ q: 'Q1', options: ['A', 'B', 'C', 'D'], answer: 'A' },
				{ q: 'Q2', options: ['A', 'B', 'C', 'D'], answer: 'B' },
				{ q: 'Q3', options: ['A', 'B', 'C', 'D'], answer: 'C' },
			],
			math: null,
			studyTip: 'Practice daily.',
		};
	},
}));

const { default: app } = await import('../src/app.js');

describe('POST /api/study', () => {
	test('400 when missing topic', async () => {
		const res = await request(app).post('/api/study').send({});
		expect(res.status).toBe(400);
		expect(res.body?.error?.message).toMatch(/invalid/i);
	});

	test('200 normal mode returns summary and quiz', async () => {
		const res = await request(app).post('/api/study').send({ topic: 'Photosynthesis' });
		expect(res.status).toBe(200);
		expect(res.body.topic).toBeTruthy();
		expect(Array.isArray(res.body.summary)).toBe(true);
		expect(Array.isArray(res.body.quiz)).toBe(true);
		expect(res.body.mode).toBe('normal');
	});

	test('200 math mode returns summary and math', async () => {
		const res = await request(app).post('/api/study').send({ topic: 'Algebra', mode: 'math' });
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.summary)).toBe(true);
		expect(Array.isArray(res.body.quiz)).toBe(true); // AI now generates quiz even in math mode
		expect(res.body.quiz.length).toBeGreaterThan(0); // Should have quiz questions
		expect(res.body.math).toBeTruthy();
		expect(res.body.mode).toBe('math');
	});
});
