import axios from 'axios';

const instance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
	timeout: 30000, // Increased to 30 seconds to allow backend processing + fallback
});

export async function generateStudyPack({ topic, mode }) {
	try {
		const { data } = await instance.post('/study', { topic, mode });
		return data;
	} catch (error) {
		if (error.code === 'ECONNABORTED') {
			throw new Error('Request timed out. The AI service may be slow. Please try again.');
		}
		throw error;
	}
}

export default instance;

