import { motion } from 'framer-motion';

export default function GlassCard({ title, icon, children, delay = 0, className = '' }) {
	return (
		<motion.section
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ delay }}
			whileHover={{ y: -3 }}
			className={`glass-card ${className}`}
		>
			{title && (
				<div className="flex items-center gap-3 mb-4">
					{icon && <span className="text-2xl">{icon}</span>}
					<h3 style={{ fontFamily: "'Playfair Display', serif", color: '#4A5568' }} 
						className="text-xl font-bold">
						{title}
					</h3>
				</div>
			)}
			{children}
		</motion.section>
	);
}

