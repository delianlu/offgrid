import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundEffects: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Large Orb 1 - Top Left */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-palm-200/20 blur-[100px]"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Large Orb 2 - Bottom Right */}
            <motion.div
                className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-sunshine-200/20 blur-[100px]"
                animate={{
                    x: [0, -30, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            {/* Medium Orb 3 - Center Right */}
            <motion.div
                className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-clay-200/10 blur-[80px]"
                animate={{
                    x: [0, -40, 0],
                    y: [0, 40, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
            />
        </div>
    );
};
