import { motion } from 'framer-motion';

/**
 * Animated badge component for achievements and status indicators
 */
export default function Badge({ children, variant = 'default', animate = true, className = '' }) {
	const variants = {
		default: 'bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] dark:from-[#505050] dark:to-[#404040]',
		success: 'bg-gradient-to-r from-[#E8E8E8] to-[#C0C0C0] dark:from-[#606060] dark:to-[#505050]',
		premium: 'bg-gradient-to-r from-[#A8A8A8] to-[#909090] dark:from-[#707070] dark:to-[#606060]',
		streak: 'bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] dark:from-[#808080] dark:to-[#707070]'
	};

	const BadgeContent = (
		<div className={`badge ${variants[variant]} ${className}`}>
			{children}
		</div>
	);

	if (animate) {
		return (
			<motion.div
				initial={{ scale: 0, rotate: -180 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{ type: 'spring', stiffness: 260, damping: 20 }}
			>
				{BadgeContent}
			</motion.div>
		);
	}

	return BadgeContent;
}

