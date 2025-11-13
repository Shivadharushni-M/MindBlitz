import { motion } from 'framer-motion';

/**
 * Enhanced button with hover animations and gradient effects
 * Supports primary (gradient) and ghost (transparent) variants
 */
export default function PremiumButton({ 
	children, 
	onClick, 
	disabled = false, 
	variant = 'primary', 
	className = '',
	icon = null,
	...props 
}) {
	const baseClass = "premium-btn";
	const variantClass = variant === 'primary' ? 'premium-btn-primary' : 'premium-btn-ghost';
	
	return (
		<motion.button
			whileHover={{ scale: disabled ? 1 : 1.05 }}
			whileTap={{ scale: disabled ? 1 : 0.95 }}
			className={`${baseClass} ${variantClass} ${className}`}
			onClick={onClick}
			disabled={disabled}
			{...props}
		>
			{icon && <span className="mr-2">{icon}</span>}
			{children}
		</motion.button>
	);
}

