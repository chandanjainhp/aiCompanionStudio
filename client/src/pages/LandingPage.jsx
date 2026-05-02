import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

const features = [
  { num: '01', title: 'Context Aware', desc: 'Agents maintain long-term memory of your projects and preferences for deeply personalized assistance.' },
  { num: '02', title: 'Project Organization', desc: 'Group conversations into projects. Manage context, artifacts, and history efficiently.' },
  { num: '03', title: 'Knowledge Base', desc: 'Upload documents and docs to give your AI specific domain knowledge it can reason over.' },
  { num: '04', title: 'Multiple Models', desc: 'Switch between LLMs via OpenRouter — use the right model for every task and budget.' },
  { num: '05', title: 'Private & Secure', desc: 'Your data stays yours. Option for local execution gives complete control over your conversations.' },
  { num: '06', title: 'Seamless Workflow', desc: 'Integrated tools for code generation, text editing, and creative brainstorming across your stack.' },
];

export default function LandingPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-primary">
        <div className="max-w-[1600px] mx-auto px-6 h-[48px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-2xl tracking-tight text-primary">AI Companion Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="editorial-link font-sans font-bold text-[14px]">
              SIGN IN
            </Link>
            <Link to="/register">
              <button className="bg-primary text-primary-foreground font-sans font-bold text-[14px] tracking-[0.3px] px-4 py-2 border-2 border-primary hover:bg-background hover:text-primary transition-colors duration-150">
                SIGN UP
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen pt-[48px] flex flex-col">
        {/* Announcement bar */}
        <div className="py-2 px-6 border-b border-border">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <span className="font-mono uppercase tracking-[1.2px] text-[12px] font-bold">
              OPEN SOURCE · POWERED BY OPENROUTER API
            </span>
            <a href="https://github.com/chandanjainhp/aiCompanionStudio" target="_blank" rel="noopener noreferrer" className="editorial-link">
              GITHUB
            </a>
          </div>
        </div>

        {/* Main content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex-1 flex items-center">
          <div className="max-w-[1600px] mx-auto px-6 w-full py-16">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Left: Typography */}
              <div>
                <p className="kicker">AI WORKSPACE / 2026</p>
                <h1 className="headline-hero mb-6">
                  Build Your<br />
                  AI Companion
                </h1>
                <p className="font-body text-[19px] leading-[1.47] text-foreground mb-8 max-w-lg">
                  Design, train, and deploy specialized AI agents tailored to your workflow.
                  Every project. Every context. Your rules.
                </p>
                
                <div className="flex items-center gap-4">
                  <Link to="/register">
                    <button className="bg-background text-primary font-sans font-bold text-[16px] tracking-[0.3px] px-[24px] py-[12px] border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-150">
                      START BUILDING FREE
                    </button>
                  </Link>
                  <Link to="/dashboard" className="editorial-link uppercase font-bold text-[14px] tracking-[0.3px]">
                    VIEW DEMO
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-12 mt-16 pt-8 border-t border-border">
                  {[
                    { val: '50+', label: 'MODELS' },
                    { val: 'INF', label: 'PROJECTS' },
                    { val: '100%', label: 'PRIVATE' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="font-display text-[48px] leading-[0.93]">{s.val}</div>
                      <div className="font-mono uppercase tracking-[1.2px] text-[12px] font-bold mt-2">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Brutalist Image / Block */}
              <div className="w-full h-full min-h-[400px] bg-muted relative">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" alt="Cyber workspace" className="w-full h-full object-cover absolute inset-0" style={{ filter: 'grayscale(100%) contrast(1.2)' }} />
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION HEADER */}
      <div className="max-w-[1600px] mx-auto px-6 mt-16">
        <div className="section-ribbon">CAPABILITIES</div>
        <div className="hard-rule"></div>
      </div>

      {/* FEATURES */}
      <section className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((f, i) => (
            <div key={f.num} className="flex flex-col">
              <span className="font-display text-[48px] leading-[0.93] mb-4">{f.num}</span>
              <h3 className="font-sans text-[20px] font-bold leading-[1.2] tracking-[-0.28px] mb-2">{f.title}</h3>
              <p className="font-body text-[16px] leading-[1.50] text-foreground">{f.desc}</p>
              <div className="hairline-rule mt-auto pt-4"></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION - Footer inverted */}
      <section className="bg-foreground text-background py-24 px-6 mt-16">
        <div className="max-w-[1600px] mx-auto">
          <p className="font-mono uppercase tracking-[1.2px] text-[13px] font-bold mb-4">START TODAY</p>
          <h2 className="font-display text-[64px] leading-[0.93] tracking-[-0.5px] mb-8 text-white">
            Build your companion.
          </h2>
          <Link to="/register">
            <button className="bg-foreground text-background font-sans font-bold text-[16px] tracking-[0.3px] px-[24px] py-[12px] border-2 border-background hover:bg-background hover:text-foreground transition-colors duration-150">
              CREATE FREE ACCOUNT
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background py-8 px-6 border-t border-muted">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <span className="font-display text-[26px]">AI COMPANION STUDIO</span>
          <span className="font-mono uppercase tracking-[1.2px] text-[11px]">© 2026 MIT LICENSE</span>
        </div>
      </footer>
    </div>
  );
}
