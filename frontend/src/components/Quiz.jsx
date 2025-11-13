import { useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from './Confetti';
import PremiumButton from './ui/PremiumButton';

export default function Quiz({ items = [] }) {
	const [answers, setAnswers] = useState({});
	const [reveal, setReveal] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);

	if (!items?.length) return <p className="text-sm text-gray-500">No quiz available.</p>;

	const handleReveal = () => {
		setReveal(true);
		const correctCount = items.filter((q, idx) => answers[idx] === q.answer).length;
		if (correctCount >= items.length / 2) {
			setShowConfetti(true);
			setTimeout(() => setShowConfetti(false), 100);
		}
	};

	return (
		<div className="space-y-4">
			<Confetti trigger={showConfetti} />
			
			{items.map((q, idx) => {
				const selected = answers[idx];
				const isCorrect = reveal && selected === q.answer;
				const isWrong = reveal && selected && selected !== q.answer;
				
				return (
					<motion.div
						key={idx}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="quiz-question-card"
					>
						<p className="font-semibold mb-3 text-gray-800 dark:text-gray-100">
							<span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2"
								style={{ background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', color: 'white' }}>
								{idx + 1}
							</span>
							{q.q}
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{q.options.map((opt, i) => {
								const chosen = selected === opt;
								const correct = reveal && opt === q.answer;
								const wrong = reveal && chosen && !correct;
								
								return (
									<motion.button
										key={i}
										whileHover={{ scale: reveal ? 1 : 1.02 }}
										whileTap={{ scale: reveal ? 1 : 0.98 }}
										className={`quiz-option ${
											correct ? 'quiz-option-correct' :
											wrong ? 'quiz-option-wrong' :
											chosen ? 'quiz-option-selected' : 
											'quiz-option-default'
										}`}
										onClick={() => !reveal && setAnswers((a) => ({ ...a, [idx]: opt }))}
										disabled={reveal}
									>
										{correct && '✓ '}
										{wrong && '✗ '}
										{opt}
									</motion.button>
								);
							})}
						</div>
						{isCorrect && (
							<p className="mt-2 text-green-600 dark:text-green-400 font-semibold">
								🎉 Correct!
							</p>
						)}
						{isWrong && (
							<p className="mt-2 text-red-600 dark:text-red-400">
								Answer: <span className="font-bold">{q.answer}</span>
							</p>
						)}
					</motion.div>
				);
			})}
			
			<div className="flex justify-end">
				<PremiumButton 
					onClick={handleReveal} 
					disabled={reveal}
					icon={reveal ? '✓' : '🎯'}
				>
					{reveal ? 'Revealed' : 'Reveal'}
				</PremiumButton>
			</div>
		</div>
	);
}

