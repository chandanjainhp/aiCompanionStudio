import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// WIRED design system — see DESIGN.md
const W = {
  ink:      '#000000',
  pageInk:  '#1a1a1a',
  paper:    '#ffffff',
  footer:   '#1a1a1a',
  caption:  '#757575',
  hairline: '#e2e8f0',
  hardRule: '#000000',
  blue:     '#057dbc',
  error:    '#e53e3e',
  disabled: '#a0aec0',
};

// Font roles (WIRED substitutes via Google Fonts)
const DISPLAY = "'Fraunces', Georgia, serif";          // WiredDisplay sub
const BODY    = "'Lora', Georgia, serif";               // BreveText sub
const UI      = "'Inter', 'Work Sans', sans-serif";    // Apercu sub
const MONO    = "'JetBrains Mono', 'Courier New', monospace"; // WiredMono sub

const USE_CASES = [
  '', 'Personal Projects', 'Research & Academia',
  'Enterprise / Business', 'Education', 'Content Creation',
  'Developer Tools', 'Other',
];

const SOURCES = [
  '', 'Search Engine', 'Social Media', 'Tech Blog / Newsletter',
  'Friend or Colleague', 'Developer Community', 'Other',
];

const STEPS = [
  {
    num: '01',
    heading: 'Application Review',
    body: 'Our team reviews every application within 3–5 business days. We read each submission carefully and evaluate use case fit.',
  },
  {
    num: '02',
    heading: 'Cohort Invitation',
    body: 'Accepted applicants receive an invitation email with an access code and onboarding instructions for their cohort start date.',
  },
  {
    num: '03',
    heading: 'Early Access Begins',
    body: 'You gain full access to AI Companion Studio, plus a direct channel to provide feedback that shapes the roadmap.',
  },
];

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessPage({ name, email }) {
  return (
    <div style={{ background: W.paper, minHeight: '100vh', color: W.pageInk }}>
      <UtilityBar />
      <MainNav />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '96px 32px 128px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: W.caption, marginBottom: 24 }}>
            APPLICATION RECEIVED
          </div>
          <div style={{ width: '100%', height: 1, background: W.hardRule, marginBottom: 40 }} />
          <h1 style={{ fontFamily: DISPLAY, fontSize: 52, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.05, color: W.pageInk, marginBottom: 24 }}>
            You're on the list,{' '}
            <span style={{ textDecoration: 'underline', textDecorationThickness: 2 }}>
              {name.split(' ')[0]}
            </span>
            .
          </h1>
          <p style={{ fontFamily: BODY, fontSize: 19, lineHeight: 1.47, letterSpacing: '0.108px', color: W.pageInk, marginBottom: 12 }}>
            We've received your early access application and sent a confirmation to{' '}
            <strong style={{ fontFamily: UI }}>{email}</strong>.
            Our team reviews applications within 3–5 business days.
          </p>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, color: W.caption, marginBottom: 48 }}>
            Keep an eye on your inbox — and your spam folder, just in case.
            Cohort invitations go out on a rolling basis.
          </p>
          <div style={{ width: '100%', height: 1, background: W.hairline, marginBottom: 40 }} />
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button
              style={{
                fontFamily: UI, fontSize: 16, fontWeight: 700,
                letterSpacing: '0.3px', textTransform: 'uppercase',
                background: W.paper, color: W.ink,
                border: `2px solid ${W.ink}`, borderRadius: 0,
                padding: '13px 32px', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = W.ink; e.currentTarget.style.color = W.paper; }}
              onMouseLeave={e => { e.currentTarget.style.background = W.paper; e.currentTarget.style.color = W.ink; }}
            >
              ← BACK TO HOME
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Utility bar ─────────────────────────────────────────────────────────────

function UtilityBar() {
  return (
    <div style={{ background: W.ink, height: 40, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[
            { label: 'HOME', to: '/' },
            { label: 'FEATURES', to: '/' },
            { label: 'DOCS', to: '/' },
          ].map(({ label, to }, i) => (
            <Link
              key={label}
              to={to}
              style={{
                fontFamily: MONO, fontSize: 11, letterSpacing: '1.1px', textTransform: 'uppercase',
                color: '#ffffff', textDecoration: 'none',
                padding: '0 14px', borderRight: i < 2 ? '1px solid #333' : 'none',
                lineHeight: '40px',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = W.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <Link
            to="/login"
            style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: '1.1px', textTransform: 'uppercase',
              color: '#ffffff', textDecoration: 'none', padding: '0 14px',
              borderLeft: '1px solid #333', lineHeight: '40px',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = W.blue)}
            onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
          >
            SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main nav ─────────────────────────────────────────────────────────────────

function MainNav() {
  return (
    <nav style={{ background: W.paper, borderBottom: `1px solid ${W.hardRule}`, height: 60, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: W.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="ACS"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'invert(1)' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <span style={{ fontFamily: UI, fontSize: 15, fontWeight: 700, color: W.pageInk, letterSpacing: '-0.1px' }}>
            AI COMPANION STUDIO
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Features', to: '/' },
            { label: 'Docs', to: '/' },
            { label: 'Register', to: '/register' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={{ fontFamily: UI, fontSize: 14, color: W.pageInk, textDecoration: 'none', letterSpacing: '0.4px' }}
              onMouseEnter={e => { e.currentTarget.style.color = W.blue; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.color = W.pageInk; e.currentTarget.style.textDecoration = 'none'; }}
            >
              {label}
            </Link>
          ))}
          <Link to="/apply" style={{ fontFamily: UI, fontSize: 14, fontWeight: 700, color: W.blue, textDecoration: 'underline', letterSpacing: '0.4px' }}>
            Apply
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section style={{ background: W.paper, padding: '64px 0 48px', borderBottom: `1px solid ${W.hardRule}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.92px', textTransform: 'uppercase', color: W.pageInk, marginBottom: 20 }}>
            EARLY ACCESS — LIMITED COHORT
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end' }}>
            <div>
              <h1
                style={{
                  fontFamily: DISPLAY, fontSize: 'clamp(42px, 5vw, 72px)',
                  fontWeight: 300, fontStyle: 'italic',
                  lineHeight: 1.02, letterSpacing: '-0.5px',
                  color: W.pageInk, margin: 0,
                }}
              >
                Apply for Early{' '}
                <span style={{ textDecoration: 'underline', textDecorationThickness: 3 }}>
                  Access
                </span>
                .
              </h1>
            </div>
            <div>
              <p style={{ fontFamily: BODY, fontSize: 19, lineHeight: 1.47, letterSpacing: '0.108px', color: W.pageInk, margin: '0 0 16px' }}>
                AI Companion Studio lets you build, configure, and converse with
                custom AI personas — all under your own API keys.
              </p>
              <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, color: W.caption, margin: 0 }}>
                Early access members shape the roadmap, get priority support,
                and lock in founding-member pricing before public launch.
              </p>
            </div>
          </div>

          {/* Stats ribbon */}
          <div style={{ marginTop: 48, borderTop: `1px solid ${W.hardRule}`, borderBottom: `1px solid ${W.hairline}`, display: 'flex' }}>
            {[
              { stat: '2,400+', label: 'APPLICATIONS RECEIVED' },
              { stat: '340',    label: 'SEATS REMAINING' },
              { stat: 'Q3 2026', label: 'NEXT COHORT OPENS' },
            ].map(({ stat, label }, i) => (
              <div
                key={label}
                style={{
                  flex: 1, padding: '20px 0',
                  borderRight: i < 2 ? `1px solid ${W.hairline}` : 'none',
                  paddingLeft: i === 0 ? 0 : 32,
                }}
              >
                <div style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 300, lineHeight: 1, color: W.pageInk, marginBottom: 6 }}>
                  {stat}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.1px', textTransform: 'uppercase', color: W.caption }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Form section ─────────────────────────────────────────────────────────────

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <label style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.92px', textTransform: 'uppercase', color: W.pageInk, display: 'block', marginBottom: 10 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontFamily: UI, fontSize: 13, color: W.error, marginTop: 6, lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function FormSection({ form, set, errors, onSubmit, submitting }) {
  const inputStyle = (hasError) => ({
    fontFamily: UI, fontSize: 16,
    border: `2px solid ${hasError ? W.error : W.ink}`, borderRadius: 0,
    padding: '12px 14px', width: '100%',
    background: W.paper, color: W.pageInk,
    outline: 'none', boxSizing: 'border-box',
  });

  return (
    <section style={{ background: W.paper, padding: '0 0 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Section ribbon */}
        <div style={{ background: W.ink, padding: '0 0 0 0', margin: '0 -32px 0', paddingLeft: 32, height: 40, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#ffffff', fontWeight: 700 }}>
            THE APPLICATION
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 64, paddingTop: 48 }}
          className="apply-form-grid"
        >

          {/* Left: program details */}
          <aside>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: W.caption, marginBottom: 16 }}>
              WHAT YOU GET
            </div>
            <div style={{ width: 40, height: 2, background: W.ink, marginBottom: 24 }} />

            {[
              { heading: 'Full Platform Access', body: 'Every feature, every model integration, every config option — available from day one.' },
              { heading: 'Founding Member Pricing', body: 'Lock in a 40% discount off the public launch price for as long as you stay subscribed.' },
              { heading: 'Direct Roadmap Input', body: 'Monthly office hours and a private feedback channel. Your use case shapes what gets built next.' },
              { heading: 'Priority Support', body: 'Skip the queue. Early access members get a dedicated Slack channel with the core team.' },
            ].map(({ heading, body }, i) => (
              <div key={i} style={{ borderTop: `1px solid ${W.hairline}`, padding: '20px 0' }}>
                <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 700, color: W.pageInk, marginBottom: 8, letterSpacing: '-0.1px' }}>
                  {heading}
                </div>
                <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: W.caption, margin: 0 }}>
                  {body}
                </p>
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${W.hairline}`, paddingTop: 24, marginTop: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: W.caption, marginBottom: 12 }}>
                QUESTIONS?
              </div>
              <p style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.6, color: W.caption, margin: 0 }}>
                Email{' '}
                <a
                  href="mailto:early@aicompanionstudio.com"
                  style={{ color: W.pageInk, textDecorationThickness: 1 }}
                  onMouseEnter={e => (e.currentTarget.style.color = W.blue)}
                  onMouseLeave={e => (e.currentTarget.style.color = W.pageInk)}
                >
                  early@aicompanionstudio.com
                </a>
              </p>
            </div>
          </aside>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <form onSubmit={onSubmit} noValidate>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <FormField label="Full Name *" error={errors.name}>
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    style={inputStyle(!!errors.name)}
                    onFocus={e => (e.target.style.outline = `2px solid ${W.ink}`)}
                    onBlur={e => (e.target.style.outline = 'none')}
                  />
                </FormField>

                <FormField label="Email Address *" error={errors.email}>
                  <input
                    type="email"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    style={inputStyle(!!errors.email)}
                    onFocus={e => (e.target.style.outline = `2px solid ${W.ink}`)}
                    onBlur={e => (e.target.style.outline = 'none')}
                  />
                </FormField>
              </div>

              <FormField label="Company / Organization" error={errors.company}>
                <input
                  type="text"
                  placeholder="Optional — leave blank if personal use"
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                  style={inputStyle(false)}
                  onFocus={e => (e.target.style.outline = `2px solid ${W.ink}`)}
                  onBlur={e => (e.target.style.outline = 'none')}
                />
              </FormField>

              <FormField label="Primary Use Case *" error={errors.useCase}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={form.useCase}
                    onChange={e => set('useCase', e.target.value)}
                    style={{
                      ...inputStyle(!!errors.useCase),
                      appearance: 'none', cursor: 'pointer',
                      paddingRight: 40,
                    }}
                  >
                    {USE_CASES.map(v => (
                      <option key={v} value={v} disabled={v === ''}>
                        {v === '' ? 'Select a use case...' : v}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontFamily: MONO, fontSize: 10, color: W.caption }}>▼</div>
                </div>
              </FormField>

              <FormField label="Describe Your Use Case *" error={errors.description}>
                <textarea
                  placeholder="Tell us what you're building or how you plan to use AI Companion Studio. The more specific, the better — we use this to prioritize cohort invitations."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={5}
                  style={{
                    ...inputStyle(!!errors.description),
                    resize: 'vertical', minHeight: 120,
                  }}
                  onFocus={e => (e.target.style.outline = `2px solid ${W.ink}`)}
                  onBlur={e => (e.target.style.outline = 'none')}
                />
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.5px', color: form.description.length < 20 ? W.caption : W.pageInk, textAlign: 'right', marginTop: 6 }}>
                  {form.description.length} CHARS {form.description.length >= 20 ? '✓' : `(${20 - form.description.length} TO GO)`}
                </div>
              </FormField>

              <FormField label="How Did You Hear About Us?" error={errors.source}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={form.source}
                    onChange={e => set('source', e.target.value)}
                    style={{
                      ...inputStyle(false),
                      appearance: 'none', cursor: 'pointer',
                      paddingRight: 40,
                    }}
                  >
                    {SOURCES.map(v => (
                      <option key={v} value={v} disabled={v === ''}>
                        {v === '' ? 'Select an option...' : v}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontFamily: MONO, fontSize: 10, color: W.caption }}>▼</div>
                </div>
              </FormField>

              {/* Terms */}
              <div style={{ marginBottom: 40, padding: '20px', border: `1px solid ${errors.agreed ? W.error : W.hairline}` }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={e => set('agreed', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: W.ink, flexShrink: 0, marginTop: 2, cursor: 'pointer' }}
                  />
                  <span style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: W.pageInk }}>
                    I have read and agree to the{' '}
                    <Link
                      to="/terms"
                      style={{ color: W.pageInk, textDecoration: 'underline', textDecorationThickness: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.color = W.blue)}
                      onMouseLeave={e => (e.currentTarget.style.color = W.pageInk)}
                    >
                      Terms of Service
                    </Link>{' '}
                    and acknowledge that my application data will be used to evaluate my request.
                  </span>
                </label>
                {errors.agreed && (
                  <p style={{ fontFamily: UI, fontSize: 13, color: W.error, marginTop: 8, marginLeft: 30 }}>
                    {errors.agreed}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderTop: `2px solid ${W.ink}`, paddingTop: 28 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    fontFamily: UI, fontSize: 16, fontWeight: 700,
                    letterSpacing: '0.3px', textTransform: 'uppercase',
                    background: W.ink, color: W.paper,
                    border: `2px solid ${W.ink}`, borderRadius: 0,
                    padding: '13px 36px', cursor: 'pointer',
                    transition: 'background 150ms, color 150ms',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    opacity: submitting ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = W.paper; e.currentTarget.style.color = W.ink; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = W.ink; e.currentTarget.style.color = W.paper; }}
                >
                  {submitting ? 'SUBMITTING...' : <>SUBMIT APPLICATION <ArrowUpRight size={16} /></>}
                </button>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.7px', textTransform: 'uppercase', color: W.caption }}>
                  NO PAYMENT REQUIRED
                </span>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .apply-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── What happens next ────────────────────────────────────────────────────────

function NextStepsSection() {
  return (
    <section style={{ background: W.paper, borderTop: `2px solid ${W.ink}`, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Ribbon header */}
        <div style={{ background: W.ink, margin: '0 -32px', padding: '0 32px', height: 40, display: 'flex', alignItems: 'center', marginBottom: 48 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#ffffff', fontWeight: 700 }}>
            WHAT HAPPENS NEXT
          </span>
        </div>

        <div style={{ maxWidth: 800 }}>
          {STEPS.map(({ num, heading, body }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
              style={{
                borderTop: `1px solid ${W.hardRule}`,
                padding: '28px 0',
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                gap: 32,
                alignItems: 'start',
                ...(i === STEPS.length - 1 ? { borderBottom: `1px solid ${W.hardRule}` } : {}),
              }}
            >
              <div style={{ fontFamily: DISPLAY, fontSize: 48, fontWeight: 300, lineHeight: 1, color: W.hairline, fontStyle: 'italic', userSelect: 'none' }}>
                {num}
              </div>
              <div>
                <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 700, letterSpacing: '-0.144px', color: W.pageInk, marginBottom: 10 }}>
                  {heading}
                </div>
                <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, letterSpacing: '0.09px', color: W.caption, margin: 0 }}>
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const cols = [
    { heading: 'PRODUCT', links: ['Features', 'Roadmap', 'Changelog', 'Status'] },
    { heading: 'DEVELOPERS', links: ['Documentation', 'API Reference', 'Open Source', 'Community'] },
    { heading: 'COMPANY', links: ['About', 'Blog', 'Careers', 'Contact'] },
    { heading: 'LEGAL', links: ['Terms of Service', 'Privacy Policy', 'Security', 'Cookie Policy'] },
  ];

  return (
    <footer style={{ background: W.footer, color: '#ffffff', padding: '56px 32px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #333' }}>
          <div style={{ width: 24, height: 24, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            <img src="/logo.png" alt="ACS" style={{ width: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: '0.05em' }}>
            AI COMPANION STUDIO
          </span>
        </div>

        {/* Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, marginBottom: 48 }}>
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#ffffff', marginBottom: 20, fontWeight: 700 }}>
                {heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(link => (
                  <a
                    key={link}
                    href="#"
                    style={{ fontFamily: UI, fontSize: 11, color: W.caption, textDecoration: 'none', letterSpacing: '0.3px', transition: 'color 120ms' }}
                    onMouseEnter={e => (e.currentTarget.style.color = W.blue)}
                    onMouseLeave={e => (e.currentTarget.style.color = W.caption)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #333', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 11, color: W.caption, letterSpacing: '0.2px' }}>
            © 2026 AI Companion Studio. MIT License.
          </span>
          <Link
            to="/apply"
            style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.9px', textTransform: 'uppercase', color: '#ffffff', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = W.blue)}
            onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
          >
            APPLY FOR EARLY ACCESS →
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function Apply() {
  const [form, setForm] = useState({
    name: '', email: '', company: '',
    useCase: '', description: '', source: '',
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = 'A valid email address is required.';
    if (!form.useCase) e.useCase = 'Please select a use case.';
    if (form.description.trim().length < 20)
      e.description = 'Please describe your use case (minimum 20 characters).';
    if (!form.agreed) e.agreed = 'You must agree to the Terms of Service.';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return <SuccessPage name={form.name} email={form.email} />;

  return (
    <div style={{ background: W.paper, color: W.pageInk, minHeight: '100vh' }}>
      <UtilityBar />
      <MainNav />
      <HeroSection />
      <FormSection form={form} set={set} errors={errors} onSubmit={handleSubmit} submitting={submitting} />
      <NextStepsSection />
      <Footer />
    </div>
  );
}
