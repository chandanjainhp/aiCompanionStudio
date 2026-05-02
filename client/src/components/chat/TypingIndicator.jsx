/**
 * TypingIndicator Component
 * 
 * Animated loading indicator for assistant messages being streamed/generated.
 * Shows three pulsing blocks with staggered animation.
 * 
 * Usage:
 * <TypingIndicator />
 */

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 bg-primary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
          aria-label={i === 0 ? "typing" : undefined}
        />
      ))}
    </div>
  );
}

export default TypingIndicator;