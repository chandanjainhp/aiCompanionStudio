import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  accent: '#E8961E',
  text: '#F0E8D8',
  muted: '#7A6A54',
  red: '#FF5C5C',
};

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        .nf-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .nf-back:hover { color: ${DB.accent} !important; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: 480 }}
      >
        {/* Glitch number */}
        <div
          className="nf-mono"
          style={{
            fontSize: 'clamp(96px, 20vw, 160px)',
            fontWeight: 700,
            lineHeight: 1,
            color: DB.border,
            letterSpacing: '-0.05em',
            marginBottom: 4,
            userSelect: 'none',
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1, 0.7, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4 }}
            style={{ color: DB.red }}
          >
            4
          </motion.span>
          <span>0</span>
          <motion.span
            animate={{ opacity: [1, 0.4, 1, 0.7, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, delay: 0.15 }}
            style={{ color: DB.red }}
          >
            4
          </motion.span>
        </div>

        <div className="nf-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 20 }}>
          ROUTE NOT FOUND
        </div>

        <div
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 24,
            fontStyle: 'italic',
            fontWeight: 300,
            color: DB.text,
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          This page doesn't exist.
        </div>

        <p className="nf-mono" style={{ fontSize: 11, color: DB.muted, marginBottom: 36, lineHeight: 1.7 }}>
          <span style={{ color: DB.accent }}>{location.pathname}</span>
          {' '}was not found on this server.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: DB.accent,
              color: '#0E0C0A',
              textDecoration: 'none',
              padding: '10px 22px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.15em',
            }}
          >
            <ArrowLeft size={11} />
            BACK TO HOME
          </Link>

          <Link
            to="/dashboard"
            className="nf-back nf-mono"
            style={{
              fontSize: 10,
              color: DB.muted,
              textDecoration: 'none',
              letterSpacing: '0.1em',
              transition: 'color 0.15s',
            }}
          >
            DASHBOARD →
          </Link>
        </div>

        {/* Status */}
        <div className="nf-mono" style={{ marginTop: 48, fontSize: 8, color: DB.border, letterSpacing: '0.2em' }}>
          ERR_NOT_FOUND · {new Date().toISOString().split('T')[0]}
        </div>
      </motion.div>
    </div>
  );
}
