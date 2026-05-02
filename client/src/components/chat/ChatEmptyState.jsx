import { motion } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export function ChatEmptyState({ projectName }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center relative z-10 max-w-2xl mx-auto flex flex-col items-center"
      >
        {/* Brutalist Block Icon */}
        <div className="relative w-16 h-16 mb-8 border-2 border-primary bg-muted/20 flex items-center justify-center shadow-[4px_4px_0_0_var(--theme-primary)]">
          <AutoAwesomeIcon sx={{ fontSize: 32 }} className="text-primary" />
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-foreground">
          {projectName ? `Hello, ${projectName}` : 'Welcome'}
        </h2>
        <p className="font-body text-base sm:text-lg text-foreground leading-relaxed max-w-md">
          I'm ready to help you create, analyze, and explore. <br className="hidden sm:block" />What's on your mind today?
        </p>
      </motion.div>
    </div>
  );
}
