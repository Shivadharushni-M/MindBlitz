import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Badge from './ui/Badge';

export default function StreakTracker() {
	const [streak, setStreak] = useState({ current: 0, total: 0 });

	useEffect(() => {
		const stored = localStorage.getItem('ssa_streak');
		if (stored) {
			const data = JSON.parse(stored);
			const lastDate = new Date(data.lastDate).toDateString();
			const today = new Date().toDateString();
			
			if (lastDate === today) {
				setStreak(data);
			} else {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				
				if (lastDate === yesterday.toDateString()) {
					const newStreak = { ...data, current: data.current + 1, lastDate: today };
					setStreak(newStreak);
					localStorage.setItem('ssa_streak', JSON.stringify(newStreak));
				} else {
					const newStreak = { current: 1, total: data.total, lastDate: today };
					setStreak(newStreak);
					localStorage.setItem('ssa_streak', JSON.stringify(newStreak));
				}
			}
		}
	}, []);

	useEffect(() => {
		const handleGenerate = () => {
			const newStreak = { 
				current: streak.current || 1, 
				total: (streak.total || 0) + 1,
				lastDate: new Date().toDateString()
			};
			setStreak(newStreak);
			localStorage.setItem('ssa_streak', JSON.stringify(newStreak));
		};
		window.addEventListener('study-generated', handleGenerate);
		return () => window.removeEventListener('study-generated', handleGenerate);
	}, [streak]);

	return (
		<motion.div 
			className="flex items-center gap-3 flex-wrap"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
		>
			{streak.current > 0 && (
				<Badge variant="streak" className="flex items-center gap-1">
					<span className="text-base">🔥</span>
					<span className="font-bold text-gray-800 dark:text-white">{streak.current}</span>
					<span className="text-xs text-gray-700 dark:text-white opacity-90">streak</span>
				</Badge>
			)}
			{streak.total > 0 && (
				<Badge variant="success" className="flex items-center gap-1">
					<span className="text-base">📚</span>
					<span className="font-bold text-gray-800 dark:text-white">{streak.total}</span>
					<span className="text-xs text-gray-700 dark:text-white opacity-90">packs</span>
				</Badge>
			)}
		</motion.div>
	);
}

