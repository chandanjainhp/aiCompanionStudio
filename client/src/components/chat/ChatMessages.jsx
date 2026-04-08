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
  return <TooltipProvider>
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
    </TooltipProvider>;
}
const MessageBubble = forwardRef(({
  message
}, ref) => {
  const [copied, setCopied] = useState(false);
  const {
    user
  } = useAuthStore();
  const isUser = message.role === 'user';
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return <motion.div ref={ref} initial={{
    opacity: 0,
    y: 12,
    scale: 0.98
  }} animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }} transition={{
    duration: 0.4,
    ease: [0.23, 1, 0.32, 1]
  }} className={cn('group flex gap-5 w-full', isUser && 'flex-row-reverse')}>
        {/* Avatar Section */}
        <div className="shrink-0 pt-1">
          {isUser ? <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size="md" className="ring-2 ring-white/5 border border-white/10" /> : <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <AutoAwesomeIcon sx={{
          fontSize: 16
        }} className="text-white" />
            </div>}
        </div>

        {/* Content Section */}
        <div className={cn('flex flex-col gap-2 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
          <div className={cn('relative px-5 py-4 rounded-[22px] text-[15px] leading-relaxed transition-all shadow-xl', isUser ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none border border-white/10' : 'bg-[#161B2C]/60 backdrop-blur-xl border border-white/10 text-slate-200 rounded-tl-none')}>
            {message.isLoading ? <TypingIndicator /> : isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <div className="prose prose-invert prose-slate max-w-none prose-p:my-0 prose-pre:my-4 prose-code:text-blue-300">
                <ReactMarkdown components={{
            code({
              node,
              className,
              children,
              ...props
            }) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match;
              return !inline && match ? <div className="rounded-xl overflow-hidden my-6 border border-white/10 bg-[#0B0F1A] shadow-2xl">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <TerminalIcon sx={{
                      fontSize: 14
                    }} className="text-blue-400" />
                              <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">{match[1]}</span>
                            </div>
                            <button onClick={() => {
                    navigator.clipboard.writeText(String(children));
                  }} className="text-[11px] font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                              <ContentCopyIcon sx={{
                      fontSize: 12
                    }} /> Copy Code
                            </button>
                          </div>
                          <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{
                  margin: 0,
                  padding: '1.25rem',
                  background: 'transparent',
                  fontSize: '13.5px'
                }}>
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div> : <code className="bg-white/10 px-1.5 py-0.5 rounded-md text-[13px] text-cyan-300 font-mono" {...props}>
                          {children}
                        </code>;
            }
          }}>
                  {message.content}
                </ReactMarkdown>
              </div>}
          </div>

          {/* Footer Actions */}
          {!message.isLoading && <div className={cn('flex items-center gap-3 px-1 transition-opacity duration-300', 'opacity-0 group-hover:opacity-100')}>
              <span className="text-[10px] font-bold tracking-widest text-slate-500/60 uppercase">
                {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : ''}
              </span>
              <div className="h-3 w-[1px] bg-white/10" />
              <button onClick={handleCopy} className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-blue-400 uppercase transition-colors flex items-center gap-1">
                {copied ? <CheckIcon sx={{
            fontSize: 10
          }} /> : <ContentCopyIcon sx={{
            fontSize: 10
          }} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>}
        </div>
      </motion.div>;
});
MessageBubble.displayName = 'MessageBubble';
function StreamingMessage({
  content
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 8
  }} animate={{
    opacity: 1,
    y: 0
  }} className="flex gap-5 w-full">
      <div className="shrink-0 pt-1">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg ring-1 ring-white/20">
          <AutoAwesomeIcon sx={{
          fontSize: 16
        }} className="text-white animate-pulse" />
        </div>
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="bg-[#161B2C]/60 backdrop-blur-xl border border-white/10 text-slate-200 px-5 py-4 rounded-[22px] rounded-tl-none shadow-xl">
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
            <span className="inline-block w-2 h-4 bg-blue-500/80 ml-1 rounded-full animate-pulse align-middle" />
          </div>
        </div>
      </div>
    </motion.div>;
}
