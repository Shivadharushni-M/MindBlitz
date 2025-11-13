import { motion } from 'framer-motion';

/**
 * Enhanced toggle switch with smooth animations
 * Features gradient colors when active
 */
export default function Toggle({ checked, onChange, label }) {
	return (
		<label className="toggle cursor-pointer select-none">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="sr-only"
			/>
			<motion.span
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onChange(!checked);
				}}
				style={{
					background: checked ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' : ''
				}}
				className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
					checked ? '' : 'bg-gray-300 dark:bg-gray-700'
				}`}
				whileTap={{ scale: 0.95 }}
			>
				<motion.span
					layout
					className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ${
						checked ? 'translate-x-6' : 'translate-x-1'
					}`}
					transition={{ type: 'spring', stiffness: 500, damping: 30 }}
				>
					<motion.div
						className="w-full h-full rounded-full flex items-center justify-center text-xs"
						animate={{ rotate: checked ? 360 : 0 }}
						transition={{ duration: 0.3 }}
					>
						{checked ? '➗' : '📝'}
					</motion.div>
				</motion.span>
			</motion.span>
			<span className="ml-3 font-medium">{label}</span>
		</label>
	);
}

