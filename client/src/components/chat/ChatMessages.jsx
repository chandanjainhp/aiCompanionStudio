import { useRef, useEffect, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypingIndicator } from './TypingIndicator';

export function ChatMessages({ messages, isStreaming, streamingContent }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
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
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={cn('group flex flex-col w-full gap-1', isUser && 'items-end')}
    >
      {/* Role label */}
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground px-1">
        {isUser ? 'YOU' : 'ASSISTANT'}
      </span>

      {/* Message content */}
      <div className={cn(
        'relative max-w-[85%] px-5 py-4 border-2 border-primary text-[15px] leading-relaxed',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
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
                  <div className="my-6 border-2 border-primary bg-background">
                    <div className="flex items-center justify-between px-4 py-2 border-b-2 border-primary bg-muted/20">
                      <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">{match[1]}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="text-[11px] font-mono font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors uppercase"
                      >
                        COPY
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

      {/* Footer actions */}
      {!message.isLoading && (
        <div className={cn('flex items-center gap-3 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300')}>
          <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
            {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : ''}
          </span>
          <div className="h-3 w-[2px] bg-primary/20" />
          <button
            onClick={handleCopy}
            className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground hover:text-primary uppercase transition-colors"
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      )}
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

function StreamingMessage({ content }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col w-full gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground px-1">
        ASSISTANT
      </span>
      <div className="max-w-[85%] border-2 border-primary bg-background text-foreground px-5 py-4">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
          <span className="inline-block w-2.5 h-4 bg-primary ml-1 animate-pulse align-middle" />
        </div>
      </div>
    </motion.div>
  );
}
