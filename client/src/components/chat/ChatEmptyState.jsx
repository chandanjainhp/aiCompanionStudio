import { motion } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
export function ChatEmptyState({
  projectName
}) {
  return <div className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5,
      ease: "easeOut"
    }} className="text-center relative z-10 max-w-2xl mx-auto">
        {/* Animated Orb / Avatar */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }} transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }} className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 blur-xl opacity-40 absolute top-0 left-0" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-background to-muted border border-white/10 shadow-2xl flex items-center justify-center backdrop-blur-md">
            <AutoAwesomeIcon sx={{
            fontSize: 40
          }} className="text-indigo-400" />
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          {projectName ? `Hello, ${projectName}` : 'Welcome'}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground/80 leading-relaxed">
          I'm ready to help you create, analyze, and explore. <br className="hidden sm:block" />What's on your mind today?
        </p>
      </motion.div>
    </div>;
}
