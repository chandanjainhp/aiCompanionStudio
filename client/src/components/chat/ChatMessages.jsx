import { useRef, useEffect, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TerminalIcon from '@mui/icons-material/Terminal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypingIndicator } from './TypingIndicator';
import { useAuthStore } from '@/store/authStore';

export function ChatMessages({
  messages,
  isStreaming,
  streamingContent
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom with smooth behavior
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, streamingContent]);

  return (
    <TooltipProvider>
      <ScrollArea ref={scrollRef} className="flex-1 w-full h-full">
        <div className="flex justify-center w-full h-full">
          <div className="flex flex-col w-full max-w-4xl pt-16 pb-32 space-y-8 px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {messages.map(message => <MessageBubble key={message.id} message={message} />)}
              {isStreaming && streamingContent && <StreamingMessage content={streamingContent} />}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}

const MessageBubble = forwardRef(({ message }, ref) => {
  const [copied, setCopied] = useState(false);
  const { user } = useAuthStore();
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 12, scale: 0.98 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} 
      className={cn('group flex gap-5 w-full', isUser && 'flex-row-reverse')}
    >
      {/* Avatar Section */}
      <div className="shrink-0 pt-1">
        {isUser ? (
          <div className="border-2 border-primary p-0.5 bg-background shadow-[2px_2px_0_0_var(--theme-primary)]">
            <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size="md" className="rounded-none" />
          </div>
        ) : (
          <div className="h-10 w-10 border-2 border-primary bg-background flex items-center justify-center shadow-[2px_2px_0_0_var(--theme-primary)]">
            <AutoAwesomeIcon sx={{ fontSize: 18 }} className="text-primary" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={cn('flex flex-col gap-2 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'relative px-5 py-4 border-2 border-primary text-[15px] leading-relaxed transition-all shadow-[4px_4px_0_0_var(--theme-primary)]', 
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted/20 text-foreground'
        )}>
          {message.isLoading ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap font-sans font-medium">{message.content}</p>
          ) : (
            <div className="prose prose-slate max-w-none prose-p:my-0 prose-pre:my-4 prose-code:text-primary dark:prose-invert">
              <ReactMarkdown components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  return !inline && match ? (
                    <div className="rounded-none my-6 border-2 border-primary bg-background shadow-[4px_4px_0_0_var(--theme-primary)]">
                      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-primary bg-muted/20">
                        <div className="flex items-center gap-2">
                          <TerminalIcon sx={{ fontSize: 14 }} className="text-primary" />
                          <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">{match[1]}</span>
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(String(children))} 
                          className="text-[11px] font-mono font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 uppercase"
                        >
                          <ContentCopyIcon sx={{ fontSize: 12 }} /> Copy
                        </button>
                      </div>
                      <SyntaxHighlighter 
                        style={oneDark} 
                        language={match[1]} 
                        PreTag="div" 
                        customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '13.5px', borderRadius: 0 }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-muted/30 px-1.5 py-0.5 font-mono text-[13px] border border-primary/20" {...props}>
                      {children}
                    </code>
                  );
                }
              }}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!message.isLoading && (
          <div className={cn('flex items-center gap-3 px-1 transition-opacity duration-300', 'opacity-0 group-hover:opacity-100')}>
            <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
              {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : ''}
            </span>
            <div className="h-3 w-[2px] bg-primary/20" />
            <button 
              onClick={handleCopy} 
              className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground hover:text-primary uppercase transition-colors flex items-center gap-1"
            >
              {copied ? <CheckIcon sx={{ fontSize: 12 }} /> : <ContentCopyIcon sx={{ fontSize: 12 }} />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

function StreamingMessage({ content }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-5 w-full">
      <div className="shrink-0 pt-1">
        <div className="h-10 w-10 border-2 border-primary bg-background flex items-center justify-center shadow-[2px_2px_0_0_var(--theme-primary)]">
          <AutoAwesomeIcon sx={{ fontSize: 18 }} className="text-primary animate-pulse" />
        </div>
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="border-2 border-primary bg-muted/20 text-foreground px-5 py-4 shadow-[4px_4px_0_0_var(--theme-primary)]">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
            <span className="inline-block w-2.5 h-4 bg-primary ml-1 animate-pulse align-middle" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
