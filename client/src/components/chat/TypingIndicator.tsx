/**
 * TypingIndicator Component
 * 
 * Animated loading indicator for assistant messages being streamed/generated.
 * Shows three pulsing dots with staggered animation using CSS animations.
 * 
 * Usage:
 * <TypingIndicator />
 */

const dotStyles = `
  @keyframes typingPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .typing-dot {
    animation: typingPulse 1.4s infinite;
  }
  .typing-dot:nth-child(1) {
    animation-delay: 0ms;
  }
  .typing-dot:nth-child(2) {
    animation-delay: 150ms;
  }
  .typing-dot:nth-child(3) {
    animation-delay: 300ms;
  }
`;

export function TypingIndicator() {
  return (
    <>
      <style>{dotStyles}</style>
      <div className="flex items-center gap-1.5 py-1">
        <span
          className="typing-dot inline-block w-2 h-2 bg-current rounded-full"
          aria-label="typing"
        />
        <span
          className="typing-dot inline-block w-2 h-2 bg-current rounded-full"
        />
        <span
          className="typing-dot inline-block w-2 h-2 bg-current rounded-full"
        />
      </div>
    </>
  );
}

export default TypingIndicator;
