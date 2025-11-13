import { motion } from 'framer-motion';

export default function History({ items = [], onSelect }) {
	if (!items.length) return null;
	
	return (
		<div className="flex flex-wrap gap-2">
			{items.map((t, i) => (
				<motion.button
					key={i}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="history-pill"
					onClick={() => onSelect(t)}
				>
					{t}
				</motion.button>
			))}
		</div>
	);
}

