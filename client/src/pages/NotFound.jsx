import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-[480px] w-full"
      >
        {/* Glitch number */}
        <div className="font-mono text-[clamp(96px,20vw,160px)] font-bold leading-none text-primary/20 tracking-tighter mb-1 select-none flex justify-center">
          <motion.span
            animate={{ opacity: [1, 0.4, 1, 0.7, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4 }}
            className="text-destructive"
          >
            4
          </motion.span>
          <span>0</span>
          <motion.span
            animate={{ opacity: [1, 0.4, 1, 0.7, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, delay: 0.15 }}
            className="text-destructive"
          >
            4
          </motion.span>
        </div>

        <div className="font-mono text-[11px] text-muted-foreground tracking-[0.3em] uppercase mb-8">
          ROUTE NOT FOUND
        </div>

        <div className="font-display text-[32px] font-black uppercase tracking-tight text-foreground mb-4 leading-tight">
          THIS PAGE DOESN'T EXIST.
        </div>

        <p className="font-mono text-[12px] text-muted-foreground mb-10 leading-relaxed max-w-sm mx-auto">
          <span className="text-primary font-bold">{location.pathname}</span>
          {' '}WAS NOT FOUND ON THIS SERVER.
        </p>

        <div className="flex gap-4 justify-center items-center">
          <Link to="/">
            <Button className="rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2 h-10 px-6">
              <ArrowLeft size={14} />
              BACK TO HOME
            </Button>
          </Link>

          <Link
            to="/dashboard"
            className="font-mono text-[11px] text-muted-foreground hover:text-primary tracking-[0.1em] transition-colors uppercase font-bold px-4 h-10 flex items-center"
          >
            DASHBOARD →
          </Link>
        </div>

        {/* Status */}
        <div className="font-mono mt-16 text-[10px] text-primary/40 tracking-[0.2em] uppercase font-bold">
          ERR_NOT_FOUND · {new Date().toISOString().split('T')[0]}
        </div>
      </motion.div>
    </div>
  );
}
