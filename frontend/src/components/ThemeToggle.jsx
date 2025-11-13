import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme, setTheme } from '../lib/storage.js';

/**
 * Enhanced theme toggle with smooth animations and transitions
 * Provides visual feedback when switching between light and dark modes
 */
export default function ThemeToggle() {
	const [theme, setThemeState] = useState(getTheme());

	useEffect(() => {
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		setTheme(theme);
	}, [theme]);

	const toggleTheme = () => {
		setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
	};

	return (
		<motion.button
			aria-label="Toggle theme"
			className="relative w-14 h-14 rounded-full overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors"
			onClick={toggleTheme}
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
		>
			<AnimatePresence mode="wait">
				{theme === 'dark' ? (
					<motion.div
						key="moon"
						initial={{ rotate: -90, opacity: 0 }}
						animate={{ rotate: 0, opacity: 1 }}
						exit={{ rotate: 90, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="text-3xl"
					>
						🌙
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
						animate={{ rotate: 0, opacity: 1, scale: 1 }}
						exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
						transition={{ duration: 0.3 }}
						className="text-3xl"
					>
						🌞
					</motion.div>
				)}
			</AnimatePresence>
		</motion.button>
	);
}

