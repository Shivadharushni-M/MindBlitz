import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './components/ThemeToggle.jsx';
import Toggle from './components/Toggle.jsx';
import EnhancedSpinner from './components/EnhancedSpinner.jsx';
import GlassCard from './components/ui/GlassCard.jsx';
import PremiumButton from './components/ui/PremiumButton.jsx';
import Badge from './components/ui/Badge.jsx';
import Quiz from './components/Quiz.jsx';
import History from './components/History.jsx';
import StreakTracker from './components/StreakTracker.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { generateStudyPack } from './lib/api.js';
import { addToHistory, getHistory } from './lib/storage.js';

export default function App() {
	const [topic, setTopic] = useState('');
	const [modeMath, setModeMath] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [data, setData] = useState(null);
	const [history, setHistory] = useState(getHistory());

	const mode = useMemo(() => (modeMath ? 'math' : 'normal'), [modeMath]);

	async function onGenerate() {
		setLoading(true);
		setError('');
		setData(null);
		try {
			const payload = await generateStudyPack({ topic, mode });
			setData(payload);
			setHistory(addToHistory(payload.topic));
			// Dispatch event for streak tracker
			window.dispatchEvent(new Event('study-generated'));
		} catch (e) {
			const msg = e?.response?.data?.error?.message || e?.message || 'Failed to generate';
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		document.title = 'MindBlitz - AI Study Assistant';
	}, []);

	return (
		<div className="relative min-h-screen premium-gradient-bg">
			<header className="mx-auto max-w-5xl px-6 pt-8 pb-4 relative z-10">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<motion.div 
						className="flex items-center gap-4 flex-wrap"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<h1 style={{ fontFamily: "'Playfair Display', serif" }} 
							className="text-4xl sm:text-5xl font-bold tracking-tight text-[#4A5568] dark:text-white">
							MindBlitz
						</h1>
						<Badge variant="premium">
							<span className="text-xs font-bold px-2 text-gray-800 dark:text-white">✨ AI Powered</span>
						</Badge>
					</motion.div>
					<ThemeToggle />
				</div>
				<div className="mt-4">
					<StreakTracker />
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 pb-20 relative z-10">
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					className="glass-card-input"
				>
					<div className="space-y-4">
						<input
							className="premium-input w-full"
							placeholder="Enter a topic (e.g., Quantum Physics)"
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && !loading && topic && onGenerate()}
						/>
						
						<div className="flex gap-3 items-center justify-between flex-wrap">
							<Toggle checked={modeMath} onChange={setModeMath} label="Math Mode" />
							<PremiumButton 
								onClick={onGenerate} 
								disabled={!topic || loading}
								icon="✨"
								className="flex-1 sm:flex-initial"
							>
								{loading ? 'Generating...' : 'Generate'}
							</PremiumButton>
						</div>
						
						{history.length > 0 && (
							<div className="pt-3 border-t border-gray-200 dark:border-gray-700">
								<p className="text-xs text-gray-500 mb-2">Recent:</p>
								<History items={history} onSelect={(t) => setTopic(t)} />
							</div>
						)}
					</div>
				</motion.section>

				{loading && <EnhancedSpinner />}
				
				{error && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="mt-6 glass-card border-l-4 border-red-500"
					>
						<p className="text-red-600 dark:text-red-400">⚠️ {error}</p>
					</motion.div>
				)}

				{data && (
					<ErrorBoundary>
						<div className="mt-8 grid gap-6">
							{/* Summary Section with icon */}
							<GlassCard title="Summary" icon="📋" delay={0.05}>
								<ul className="space-y-2">
									{data.summary?.map((s, i) => (
										<motion.li
											key={i}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.1 + i * 0.05 }}
											className="flex items-start gap-2"
										>
											<span className="text-blue-500 mt-1">▸</span>
											<span className="text-gray-700 dark:text-gray-300">{s}</span>
										</motion.li>
									))}
								</ul>
							</GlassCard>

							{/* Show Math Question in math mode */}
							{data.mode === 'math' && (
								<GlassCard title="Math Question" icon="➗" delay={0.1}>
									{data.math ? (
										<div className="space-y-4">
											<div className="math-section math-question">
												<p className="font-semibold text-lg mb-2 flex items-center gap-2">
													<span>❓</span> Question:
												</p>
												<p className="text-gray-800 dark:text-gray-200">{data.math.question}</p>
											</div>
											<div className="math-section math-answer">
												<p className="font-semibold mb-1 flex items-center gap-2">
													<span>✓</span> Answer:
												</p>
												<p className="font-mono text-lg">{data.math.answer}</p>
											</div>
											<div className="math-section math-explanation">
												<p className="font-semibold mb-1 flex items-center gap-2">
													<span>💭</span> Explanation:
												</p>
												<p className="text-sm">{data.math.explanation}</p>
											</div>
										</div>
									) : (
										<p className="text-sm text-gray-500">No question generated.</p>
									)}
								</GlassCard>
							)}

							{/* Quiz Section */}
							<GlassCard title="Quiz Time" icon="🎯" delay={data.mode === 'math' ? 0.15 : 0.1}>
								<Quiz items={data.quiz} />
							</GlassCard>

							{/* Study Tip */}
							<GlassCard title="Study Tip" icon="💡" delay={data.mode === 'math' ? 0.2 : 0.15}>
								<div className="study-tip-card">
									<p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.studyTip}</p>
								</div>
							</GlassCard>

							{/* Fun Fact */}
							{data.funFact && (
								<GlassCard title="Fun Fact" icon="🌟" delay={data.mode === 'math' ? 0.25 : 0.2}>
									<div className="fun-fact-card">
										<p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.funFact}</p>
									</div>
								</GlassCard>
							)}

							{/* Source footer */}
							{data.source?.wikipedia && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
									className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1"
								>
									<p>
										<span className="text-xs">🌍</span> Source:{' '}
										<a 
											className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors" 
											href={data.source.wikipedia} 
											target="_blank" 
											rel="noreferrer"
										>
											Wikipedia
										</a>
									</p>
									<p className="text-xs">Generated at {new Date(data.timestamp).toLocaleString()}</p>
								</motion.div>
							)}
						</div>
					</ErrorBoundary>
				)}
			</main>
		</div>
	);
}

