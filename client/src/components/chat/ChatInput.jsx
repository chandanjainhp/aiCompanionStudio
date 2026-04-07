import { useState, useRef, useEffect } from 'react';
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-disable-next-line no-unused-vars */
import SendIcon from '@mui/icons-material/Send';
/* eslint-disable-next-line no-unused-vars */
import StopIcon from '@mui/icons-material/Stop';
/* eslint-disable-next-line no-unused-vars */
import AttachFileIcon from '@mui/icons-material/AttachFile';
/* eslint-disable-next-line no-unused-vars */
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
/* eslint-disable-next-line no-unused-vars */
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
/* eslint-disable-next-line no-unused-vars */
import { Button } from '@/components/ui/button';
/* eslint-disable-next-line no-unused-vars */
import { Textarea } from '@/components/ui/textarea';
/* eslint-disable-next-line no-unused-vars */
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = 'Type a message...'
}) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const handleSubmit = () => {
    if (message.trim() && !disabled && !isStreaming) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const handleChange = e => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  return <TooltipProvider>
      <div className="w-full flex justify-center relative">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="relative group">
            {/* 1️⃣ Subtle Outer Glow on Focus */}
            <div className={cn("absolute -inset-[1.5px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40 rounded-[24px] transition-all duration-500 blur-md opacity-0", isFocused && message.trim() && "opacity-100")} />

            {/* 2️⃣ Main Input Box - Full Width Responsive */}
            <div className={cn("relative flex items-end gap-2 rounded-[22px] border transition-all duration-300 p-3 w-full", "bg-[#161B2C]/80 backdrop-blur-2xl shadow-2xl", isFocused ? "border-white/20 ring-1 ring-white/10 shadow-blue-900/20" : "border-white/5")}>
              {/* Attachment Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors" disabled>
                    <AttachFileIcon sx={{
                    fontSize: 16
                  }} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-white/10 text-xs">
                  Attach context
                </TooltipContent>
              </Tooltip>

              {/* 3️⃣ Refined Textarea */}
              <Textarea ref={textareaRef} value={message} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} disabled={disabled || isStreaming} rows={1} className={cn('flex-1 resize-none border-0 bg-transparent px-2 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0', 'min-h-[40px] max-h-[200px] placeholder:text-white/20', 'text-[15px] text-slate-100 leading-relaxed custom-scrollbar')} />

              {/* 4️⃣ Action Buttons */}
              <div className="flex items-center gap-2 pb-1 pr-1">
                <AnimatePresence mode="wait">
                  {isStreaming ? <motion.div key="stop" initial={{
                  scale: 0.8,
                  opacity: 0
                }} animate={{
                  scale: 1,
                  opacity: 1
                }} exit={{
                  scale: 0.8,
                  opacity: 0
                }}>
                      <Button onClick={onStop} size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90 transition-transform active:scale-90">
                        <StopIcon sx={{
                      fontSize: 12
                    }} />
                      </Button>
                    </motion.div> : <motion.div key="send" initial={{
                  scale: 0.8,
                  opacity: 0
                }} animate={{
                  scale: 1,
                  opacity: 1
                }} exit={{
                  scale: 0.8,
                  opacity: 0
                }} className="flex items-center gap-2">
                      {/* Keyboard Hint (Visible when typing) */}
                      {message.length > 0 && !disabled && <span className="text-[10px] text-white/30 font-medium hidden sm:flex items-center gap-1">
                          Press <KeyboardReturnIcon sx={{
                      fontSize: 10
                    }} />
                        </span>}

                      <Button onClick={handleSubmit} disabled={!message.trim() || disabled} size="icon" className={cn("h-8 w-8 rounded-full transition-all duration-300", message.trim() ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20" : "bg-white/5 text-white/20 cursor-not-allowed")}>
                        <SendIcon sx={{
                      fontSize: 14
                    }} />
                      </Button>
                    </motion.div>}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* 5️⃣ Subtle Footer Note */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="text-[10px] text-white/20 font-medium uppercase tracking-[0.1em] flex items-center">
              <AutoAwesomeIcon sx={{
              fontSize: 12
            }} className="mr-1.5 text-blue-500/50" />
              AI-Powered Workspace
            </motion.p>
          </div>
        </div>
      </div>
    </TooltipProvider>;
}
