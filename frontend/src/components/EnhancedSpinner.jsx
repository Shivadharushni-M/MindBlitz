import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function EnhancedSpinner() {
	const [messageIndex, setMessageIndex] = useState(0);
	const messages = ['🧠 Thinking...', '📖 Analyzing...', '✨ Generating...'];

	useEffect(() => {
		const interval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % messages.length);
		}, 1500);
		return () => clearInterval(interval);
	}, [messages.length]);

	return (
		<div className="flex flex-col items-center py-12">
			<div className="relative w-16 h-16">
				<motion.div
					className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C0C0C0]"
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
				/>
				<motion.div
					className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#A8A8A8]"
					animate={{ rotate: -360 }}
					transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
				/>
				<motion.div
					className="absolute inset-4 rounded-full border-4 border-transparent border-t-[#909090]"
					animate={{ rotate: 360 }}
					transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
				/>
			</div>
			<motion.p
				key={messageIndex}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="mt-4 font-semibold"
				style={{ color: '#4A5568' }}
			>
				{messages[messageIndex]}
			</motion.p>
		</div>
	);
}
