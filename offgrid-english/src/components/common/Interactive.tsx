import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface InteractiveProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Interactive({ children, className = '', onClick, ...props }: InteractiveProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={`cursor-pointer ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
}
