import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  accent: '#E8961E',
  text: '#F0E8D8',
  muted: '#7A6A54',
};

const sections = [
  {
    num: '01',
    title: 'Introduction',
    body: 'Welcome to AI Companion Studio. By creating an account and using our services, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.',
  },
  {
    num: '02',
    title: 'Data Privacy & AI Models',
    body: 'We prioritize your data privacy. When using our OpenRoute API integration: Your prompts and conversations are processed securely. We do not use your personal data to train public AI models without your explicit consent. You retain ownership of the content you generate.',
    list: [
      'Your prompts and conversations are processed securely.',
      'We do not use your personal data to train public AI models without your explicit consent.',
      'You retain ownership of the content you generate.',
    ],
  },
  {
    num: '03',
    title: 'User Responsibilities',
    body: 'You agree not to use the platform to generate harmful, illegal, or abusive content. We reserve the right to suspend accounts that violate our usage policies.',
  },
  {
    num: '04',
    title: 'OpenRoute API Usage',
    body: 'This application utilizes the OpenRoute API for AI inference. Usage is subject to OpenRoute\'s API terms of service and usage limits associated with your account tier.',
  },
  {
    num: '05',
    title: 'Updates to Terms',
    body: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.',
  },
];

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text }}>
      <style>{`
        .tos-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: `1px solid ${DB.border}`, background: `${DB.bg}ee`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
            <Link
              to="/register"
              className="tos-mono"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: DB.muted, textDecoration: 'none', letterSpacing: '0.1em', transition: 'color 0.15s', border: `1px solid ${DB.border}`, padding: '6px 12px' }}
              onMouseEnter={e => (e.currentTarget.style.color = DB.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = DB.muted)}
            >
              <ArrowLeft size={11} />
              BACK
            </Link>
            <div className="tos-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.2em' }}>
              TERMS &amp; PRIVACY POLICY
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: `1px solid ${DB.border}` }}>
            <div className="tos-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 16 }}>
              LEGAL DOCUMENT
            </div>
            <h1
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(36px, 6vw, 56px)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.05,
                marginBottom: 16,
                color: DB.text,
              }}
            >
              Terms &amp; <span style={{ color: DB.accent }}>Privacy Policy</span>
            </h1>
            <div className="tos-mono" style={{ fontSize: 10, color: DB.muted, letterSpacing: '0.05em' }}>
              Last updated: January 2026
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: '24px 28px' }}
              >
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div
                    className="tos-mono"
                    style={{ fontSize: 28, fontWeight: 700, color: DB.border, lineHeight: 1, flexShrink: 0, minWidth: 40, userSelect: 'none' }}
                  >
                    {s.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="tos-mono" style={{ fontSize: 11, color: DB.accent, letterSpacing: '0.1em', marginBottom: 12, fontWeight: 600 }}>
                      {s.title.toUpperCase()}
                    </div>
                    {s.list ? (
                      <>
                        <p style={{ fontSize: 13, color: DB.muted, lineHeight: 1.75, marginBottom: 12 }}>
                          We prioritize your data privacy. When using our OpenRoute API integration:
                        </p>
                        <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {s.list.map((item, j) => (
                            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ color: DB.accent, flexShrink: 0, marginTop: 2 }}>→</span>
                              <span style={{ fontSize: 13, color: DB.muted, lineHeight: 1.65 }}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p style={{ fontSize: 13, color: DB.muted, lineHeight: 1.75 }}>{s.body}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${DB.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span className="tos-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.1em' }}>
              AI COMPANION STUDIO · MIT LICENSE
            </span>
            <Link
              to="/register"
              className="tos-mono"
              style={{ fontSize: 10, color: DB.accent, textDecoration: 'none', letterSpacing: '0.1em' }}
            >
              BACK TO REGISTER →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
