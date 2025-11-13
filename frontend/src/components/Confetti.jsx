import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Confetti celebration animation for quiz completion
 * Creates floating particles with random colors and positions
 */
export default function Confetti({ trigger }) {
	const [particles, setParticles] = useState([]);

	useEffect(() => {
		if (trigger) {
			// Generate 50 confetti particles
			const newParticles = Array.from({ length: 50 }, (_, i) => ({
				id: i,
				x: Math.random() * window.innerWidth,
				y: -20,
				rotation: Math.random() * 360,
				color: ['#C0C0C0', '#A8A8A8', '#E8E8E8', '#FFFFFF'][Math.floor(Math.random() * 4)],
				size: Math.random() * 10 + 5,
				delay: Math.random() * 0.2,
			}));
			setParticles(newParticles);

			// Clear after animation
			setTimeout(() => setParticles([]), 3000);
		}
	}, [trigger]);

	return (
		<div className="confetti-container">
			<AnimatePresence>
				{particles.map((particle) => (
					<motion.div
						key={particle.id}
						initial={{
							x: particle.x,
							y: particle.y,
							rotate: particle.rotation,
							opacity: 1,
						}}
						animate={{
							y: window.innerHeight + 100,
							rotate: particle.rotation + 720,
							opacity: 0,
						}}
						exit={{ opacity: 0 }}
						transition={{
							duration: 2.5,
							delay: particle.delay,
							ease: 'easeIn',
						}}
						style={{
							position: 'fixed',
							width: particle.size,
							height: particle.size,
							backgroundColor: particle.color,
							borderRadius: '50%',
							pointerEvents: 'none',
							zIndex: 9999,
						}}
					/>
				))}
			</AnimatePresence>
		</div>
	);
}

