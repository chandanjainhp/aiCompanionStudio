import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
  })
};

const features = [
  { num: '01', title: 'Context Aware', desc: 'Agents maintain long-term memory of your projects and preferences for deeply personalized assistance.', tag: 'MEMORY' },
  { num: '02', title: 'Project Organization', desc: 'Group conversations into projects. Manage context, artifacts, and history efficiently.', tag: 'ORGANIZE' },
  { num: '03', title: 'Knowledge Base', desc: 'Upload documents and docs to give your AI specific domain knowledge it can reason over.', tag: 'KNOWLEDGE' },
  { num: '04', title: 'Multiple Models', desc: 'Switch between LLMs via OpenRouter — use the right model for every task and budget.', tag: 'MODELS' },
  { num: '05', title: 'Private & Secure', desc: 'Your data stays yours. Option for local execution gives complete control over your conversations.', tag: 'SECURE' },
  { num: '06', title: 'Seamless Workflow', desc: 'Integrated tools for code generation, text editing, and creative brainstorming across your stack.', tag: 'WORKFLOW' },
];

const chatMessages = [
  { role: 'user', text: 'Help me refactor this authentication flow' },
  { role: 'ai', text: "Analyzed your auth module. Three opportunities:" },
  { role: 'ai', text: '1. Extract token refresh logic\n2. Add retry interceptor\n3. Centralize error handling' },
  { role: 'user', text: 'Can you write the interceptor?' },
  { role: 'ai', text: 'Writing it now with full TypeScript types...' },
];

export default function LandingPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const [activeChat, setActiveChat] = useState(0);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    if (activeChat < chatMessages.length - 1) {
      const t = setTimeout(() => setActiveChat(p => p + 1), 1800);
      return () => clearTimeout(t);
    }
  }, [activeChat]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: '#F2EDE4', color: '#1C1510', fontFamily: "'Instrument Serif', Georgia, serif" }}
      className="min-h-screen overflow-x-hidden"
    >
      <style>{`
        .acs-bebas { font-family: 'Bebas Neue', 'Impact', sans-serif; letter-spacing: 0.02em; }
        .acs-mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
        .acs-serif { font-family: 'Instrument Serif', Georgia, serif; }
        @keyframes acs-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .acs-marquee-track { overflow: hidden; white-space: nowrap; }
        .acs-marquee-inner { display: inline-block; animation: acs-marquee 35s linear infinite; }
        @keyframes acs-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .acs-blink { animation: acs-blink 1.1s step-end infinite; }
        .acs-feature-row:hover .acs-feature-num { color: #FF3D1C; }
        .acs-feature-row:hover .acs-feature-arrow { opacity: 1; transform: translateX(0); }
        .acs-feature-arrow { opacity: 0; transform: translateX(-10px); transition: all 0.3s ease; }
        .acs-nav-btn:hover { background-color: #FF3D1C !important; }
        .acs-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,61,28,0.4); }
        .acs-cta-secondary:hover { background-color: rgba(255,255,255,0.12); }
      `}</style>

      {/* NAV */}
      <nav
        style={{ borderBottom: '1px solid #D4CCBF', backgroundColor: 'rgba(242,237,228,0.94)' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded overflow-hidden shrink-0">
              <img src="/logo.png" alt="ACS" className="w-full h-full object-contain" />
            </div>
            <span className="acs-bebas text-xl" style={{ letterSpacing: '0.15em' }}>AI Companion Studio</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/login"
              className="acs-mono text-xs tracking-wider transition-colors hidden sm:block"
              style={{ color: '#8A7F75' }}
              onMouseEnter={e => e.target.style.color = '#FF3D1C'}
              onMouseLeave={e => e.target.style.color = '#8A7F75'}
            >
              SIGN IN
            </Link>
            <Link to="/login" className="sm:hidden acs-mono text-xs" style={{ color: '#8A7F75' }}>
              LOGIN
            </Link>
            <Link to="/register">
              <button
                className="acs-mono text-xs tracking-wider px-4 py-2 transition-colors acs-nav-btn"
                style={{ backgroundColor: '#1C1510', color: '#F2EDE4', border: 'none' }}
              >
                GET STARTED →
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen pt-14 flex flex-col">
        {/* Announcement bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ borderBottom: '1px solid #D4CCBF' }}
          className="py-2 px-6"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="acs-mono text-xs" style={{ color: '#8A7F75' }}>
              OPEN SOURCE · POWERED BY OPENROUTER API · FREE TO START
            </span>
            <a
              href="https://github.com/chandanjainhp/aiCompanionStudio"
              target="_blank" rel="noopener noreferrer"
              className="acs-mono text-xs hidden sm:block transition-colors"
              style={{ color: '#FF3D1C' }}
            >
              ↗ GITHUB
            </a>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full py-12 lg:py-20">
            <div className="grid lg:grid-cols-[1fr_420px] gap-10 xl:gap-16 items-center">

              {/* Left: Typography */}
              <div>
                <motion.p
                  variants={fadeUp} initial="hidden" animate="visible" custom={0}
                  className="acs-mono text-xs tracking-widest mb-5"
                  style={{ color: '#FF3D1C', letterSpacing: '0.3em' }}
                >
                  AI WORKSPACE / 2026
                </motion.p>

                <motion.h1
                  variants={fadeUp} initial="hidden" animate="visible" custom={1}
                  className="acs-bebas leading-none mb-6"
                  style={{ fontSize: 'clamp(68px, 11vw, 148px)', lineHeight: 0.88 }}
                >
                  Build Your<br />
                  <span style={{ color: '#FF3D1C' }}>AI</span><br />
                  Companion
                </motion.h1>

                <motion.p
                  variants={fadeUp} initial="hidden" animate="visible" custom={2}
                  className="text-lg lg:text-xl mb-8 max-w-lg"
                  style={{ color: '#8A7F75', fontStyle: 'italic', lineHeight: 1.65 }}
                >
                  Design, train, and deploy specialized AI agents tailored to your workflow.
                  Every project. Every context. Your rules.
                </motion.p>

                <motion.div
                  variants={fadeUp} initial="hidden" animate="visible" custom={3}
                  className="flex items-center gap-3 flex-wrap"
                >
                  <Link to="/register">
                    <button
                      className="acs-mono text-xs sm:text-sm tracking-wider px-6 sm:px-8 py-3 sm:py-4 transition-all duration-200 acs-cta-primary"
                      style={{ backgroundColor: '#FF3D1C', color: 'white', border: '2px solid #FF3D1C' }}
                    >
                      START BUILDING FREE →
                    </button>
                  </Link>
                  <Link to="/dashboard">
                    <button
                      className="acs-mono text-xs sm:text-sm tracking-wider px-6 sm:px-8 py-3 sm:py-4 transition-all duration-200"
                      style={{ border: '2px solid #1C1510', color: '#1C1510', backgroundColor: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1510'; e.currentTarget.style.color = '#F2EDE4'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1C1510'; }}
                    >
                      VIEW DEMO
                    </button>
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  variants={fadeUp} initial="hidden" animate="visible" custom={4}
                  className="flex gap-8 sm:gap-12 mt-12 pt-10"
                  style={{ borderTop: '1px solid #D4CCBF' }}
                >
                  {[
                    { val: '50+', label: 'AI Models' },
                    { val: '∞', label: 'Projects' },
                    { val: '100%', label: 'Private' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="acs-bebas text-4xl sm:text-5xl" style={{ color: '#1C1510', lineHeight: 1 }}>{s.val}</div>
                      <div className="acs-mono text-xs mt-1" style={{ color: '#8A7F75', letterSpacing: '0.1em' }}>{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Terminal mockup */}
              <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="hidden lg:block"
              >
                <div
                  style={{
                    backgroundColor: '#1A3326',
                    border: '2px solid #1C1510',
                    fontFamily: "'IBM Plex Mono', monospace",
                    boxShadow: '8px 8px 0px #1C1510',
                  }}
                >
                  {/* Terminal titlebar */}
                  <div
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.25)' }}
                    className="px-4 py-3 flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5F56' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27C93F' }} />
                    <span className="acs-mono text-xs ml-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      ai-companion — auth-refactor
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="p-5 space-y-3" style={{ minHeight: '300px' }}>
                    <AnimatePresence>
                      {chatMessages.slice(0, activeChat + 1).map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'user' ? 16 : -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            style={{
                              maxWidth: '87%',
                              backgroundColor: msg.role === 'user' ? '#FF3D1C' : 'rgba(255,255,255,0.07)',
                              color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.82)',
                              fontSize: '11.5px',
                              lineHeight: '1.55',
                              whiteSpace: 'pre-line',
                              padding: '8px 12px',
                            }}
                          >
                            {msg.role === 'ai' && (
                              <span style={{ color: '#4ADE80', marginRight: '6px', fontSize: '10px' }}>◆</span>
                            )}
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {activeChat === chatMessages.length - 1 && (
                      <div className="acs-blink text-sm" style={{ color: '#FF3D1C' }}>█</div>
                    )}
                  </div>

                  {/* Input */}
                  <div
                    style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                    className="px-4 py-3 flex items-center gap-2"
                  >
                    <span style={{ color: '#FF3D1C' }} className="text-sm">›</span>
                    <span className="acs-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Ask your companion anything...
                    </span>
                  </div>
                </div>

                {/* Terminal caption */}
                <p className="acs-mono text-xs mt-3 text-right" style={{ color: '#8A7F75' }}>
                  project: auth-refactor · model: claude-3.5-sonnet
                </p>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* MARQUEE DIVIDER */}
      <div
        style={{ borderTop: '2px solid #1C1510', borderBottom: '1px solid #D4CCBF' }}
        className="py-3 acs-marquee-track"
      >
        <div className="acs-marquee-inner acs-mono text-xs" style={{ color: '#8A7F75', letterSpacing: '0.3em' }}>
          {Array(6).fill('AI COMPANION STUDIO · CONTEXT AWARE · MULTIPLE MODELS · PRIVATE & SECURE · PROJECT MANAGEMENT · KNOWLEDGE BASE · ').join('')}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-[260px_1fr] gap-12 xl:gap-20">

          {/* Sticky label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="acs-mono text-xs tracking-widest mb-3" style={{ color: '#FF3D1C', letterSpacing: '0.3em' }}>
              CAPABILITIES
            </p>
            <h2 className="acs-bebas text-6xl lg:text-7xl leading-none">
              What<br />You<br />Get
            </h2>
            <p className="mt-5 text-base" style={{ color: '#8A7F75', fontStyle: 'italic', lineHeight: 1.6 }}>
              Every tool to build, deploy, and manage AI companions that fit your actual workflow.
            </p>
          </motion.div>

          {/* Feature rows */}
          <div>
            {features.map((f, i) => (
              <motion.div
                key={f.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.05 }}
                className="acs-feature-row group py-7 flex gap-5 items-start cursor-default"
                style={{ borderBottom: '1px solid #D4CCBF' }}
              >
                <span
                  className="acs-bebas text-5xl leading-none acs-feature-num shrink-0 transition-colors duration-300"
                  style={{ color: '#D4CCBF', lineHeight: 1 }}
                >
                  {f.num}
                </span>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="text-xl font-normal" style={{ fontStyle: 'italic' }}>{f.title}</h3>
                    <span
                      className="acs-mono text-[10px] tracking-wider px-2 py-0.5"
                      style={{ color: '#8A7F75', border: '1px solid #D4CCBF' }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <p style={{ color: '#8A7F75', lineHeight: 1.65, fontSize: '0.95rem' }}>{f.desc}</p>
                </div>
                <span
                  className="acs-feature-arrow self-center text-xl shrink-0"
                  style={{ color: '#FF3D1C' }}
                >
                  →
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Dark forest section */}
      <section style={{ backgroundColor: '#1A3326', color: 'white' }} className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="acs-mono text-xs tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em' }}>
              HOW IT WORKS
            </p>
            <h2 className="acs-bebas leading-none" style={{ fontSize: 'clamp(52px, 9vw, 120px)', lineHeight: 0.88 }}>
              Three Steps.<br />
              <span style={{ color: '#FF3D1C' }}>One Workflow.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-0">
            {[
              { n: '1', title: 'Create a Project', desc: 'Set up your AI workspace with a name, context, and knowledge base. Define exactly what your companion knows.' },
              { n: '2', title: 'Configure Your Agent', desc: 'Choose your model, craft system prompts, upload documents. Tune it precisely for your use case.' },
              { n: '3', title: 'Build & Ship', desc: 'Chat, iterate, create. Your AI companion remembers context and grows smarter with every session.' },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.15 }}
                className="p-8 lg:p-10"
                style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
              >
                <div
                  className="acs-bebas leading-none mb-5"
                  style={{ fontSize: '96px', color: 'rgba(255,255,255,0.06)', lineHeight: 1 }}
                >
                  {step.n}
                </div>
                <h3
                  className="text-lg font-normal mb-3"
                  style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.88)' }}
                >
                  {step.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN SOURCE STRIP */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ backgroundColor: '#F2EDE4', borderTop: '1px solid #D4CCBF', borderBottom: '2px solid #1C1510' }}
        className="py-10 px-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="acs-mono text-xs tracking-widest mb-2" style={{ color: '#FF3D1C', letterSpacing: '0.25em' }}>OPEN SOURCE</p>
            <h3 className="acs-bebas text-4xl sm:text-5xl" style={{ lineHeight: 0.9 }}>
              Built in public.<br />Free forever.
            </h3>
          </div>
          <a
            href="https://github.com/chandanjainhp/aiCompanionStudio"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="acs-mono text-xs tracking-wider px-7 py-3 transition-all duration-200 shrink-0"
              style={{ border: '2px solid #1C1510', color: '#1C1510', backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1510'; e.currentTarget.style.color = '#F2EDE4'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1C1510'; }}
            >
              ↗ STAR ON GITHUB
            </button>
          </a>
        </div>
      </motion.div>

      {/* CTA — Vermillion section */}
      <section style={{ backgroundColor: '#FF3D1C' }} className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10"
          >
            <div>
              <h2
                className="acs-bebas text-white leading-none"
                style={{ fontSize: 'clamp(64px, 11vw, 140px)', lineHeight: 0.88 }}
              >
                Start<br />Building<br />Today.
              </h2>
            </div>
            <div className="shrink-0 lg:text-right">
              <p className="text-lg mb-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.6 }}>
                Free to start. No credit card required.<br />Open source and self-hostable.
              </p>
              <Link to="/register" className="block">
                <button
                  className="acs-mono text-sm tracking-wider px-10 py-5 w-full lg:w-auto transition-all duration-200 acs-cta-primary"
                  style={{ backgroundColor: 'white', color: '#FF3D1C', border: '2px solid white' }}
                >
                  CREATE FREE ACCOUNT →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1C1510' }} className="py-7 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="acs-bebas text-lg" style={{ letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)' }}>
            AI COMPANION STUDIO
          </span>
          <span className="acs-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 · MIT LICENSE
          </span>
        </div>
      </footer>
    </div>
  );
}
