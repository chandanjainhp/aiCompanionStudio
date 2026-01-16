import { motion } from 'framer-motion';
import { MessageSquare, Zap, Brain, Lightbulb, Code } from 'lucide-react';

interface ChatEmptyStateProps {
  projectName?: string;
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Lightbulb,
    title: 'Brainstorm ideas',
    prompt: 'Help me brainstorm creative ideas for my next project',
  },
  {
    icon: Code,
    title: 'Write code',
    prompt: 'Write a Python function that sorts a list of numbers',
  },
  {
    icon: Brain,
    title: 'Explain a concept',
    prompt: 'Explain how machine learning works in simple terms',
  },
  {
    icon: Zap,
    title: 'Quick task',
    prompt: 'Summarize the key points of effective communication',
  },
];

export function ChatEmptyState({ projectName, onSuggestionClick }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {projectName ? `Chat with ${projectName}` : 'Start a conversation'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          Ask questions, get help with tasks, or just have a chat. Your AI assistant is ready to help.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <suggestion.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                {suggestion.title}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {suggestion.prompt}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
