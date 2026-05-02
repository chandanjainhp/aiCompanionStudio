import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="bg-background min-h-screen text-foreground">
      <UtilityBar />
      <MainNav />
      <div className="max-w-[680px] mx-auto px-8 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-[12px] tracking-[1.2px] uppercase text-muted-foreground mb-6">
            APPLICATION RECEIVED
          </div>
          <div className="w-full h-[2px] bg-primary mb-10" />
          <h1 className="font-display text-[52px] font-black leading-[1.05] text-foreground mb-6 uppercase tracking-tight">
            You're on the list,{' '}
            <span className="underline decoration-2 underline-offset-4">
              {name.split(' ')[0]}
            </span>
            .
          </h1>
          <p className="font-body text-[19px] leading-[1.47] tracking-[0.108px] text-foreground mb-3">
            We've received your early access application and sent a confirmation to{' '}
            <strong className="font-mono">{email}</strong>.
            Our team reviews applications within 3–5 business days.
          </p>
          <p className="font-body text-[16px] leading-[1.5] text-muted-foreground mb-12">
            Keep an eye on your inbox — and your spam folder, just in case.
            Cohort invitations go out on a rolling basis.
          </p>
          <div className="w-full h-[2px] bg-primary mb-10" />
          <Link to="/" className="inline-block">
            <Button variant="outline" className="rounded-none border-2 border-primary font-mono text-[16px] font-bold tracking-[0.3em] uppercase py-6 px-8">
              ← BACK TO HOME
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Utility bar ─────────────────────────────────────────────────────────────

function UtilityBar() {
  return (
    <div className="bg-foreground h-10 flex items-center">
      <div className="max-w-[1280px] mx-auto w-full px-8 flex items-center justify-between">
        <div className="flex items-center h-full">
          {[
            { label: 'HOME', to: '/' },
            { label: 'FEATURES', to: '/' },
            { label: 'DOCS', to: '/' },
          ].map(({ label, to }, i) => (
            <Link
              key={label}
              to={to}
              className={cn(
                "font-mono text-[11px] tracking-[1.1px] uppercase text-background hover:text-primary transition-colors px-4 leading-[40px] h-full flex items-center",
                i < 2 && "border-r border-background/20"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center h-full">
          <Link
            to="/login"
            className="font-mono text-[11px] tracking-[1.1px] uppercase text-background hover:text-primary transition-colors px-4 border-l border-background/20 leading-[40px] h-full flex items-center"
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
    <nav className="bg-background border-b-2 border-primary h-[60px] flex items-center">
      <div className="max-w-[1280px] mx-auto w-full px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-foreground flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/logo.png"
              alt="ACS"
              className="w-full h-full object-contain invert"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <span className="font-display text-[15px] font-black text-foreground tracking-tight uppercase">
            AI COMPANION STUDIO
          </span>
        </Link>
        <div className="flex items-center gap-8">
          {[
            { label: 'Features', to: '/' },
            { label: 'Docs', to: '/' },
            { label: 'Register', to: '/register' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="font-mono text-[14px] font-bold uppercase text-foreground hover:text-primary hover:underline transition-all tracking-[0.1em]"
            >
              {label}
            </Link>
          ))}
          <Link to="/apply" className="font-mono text-[14px] font-bold uppercase text-primary underline tracking-[0.1em]">
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
    <section className="bg-background pt-16 pb-12 border-b-2 border-primary">
      <div className="max-w-[1280px] mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="font-mono text-[13px] tracking-[0.92px] uppercase text-foreground mb-5 font-bold">
            EARLY ACCESS — LIMITED COHORT
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <h1 className="font-display text-[42px] md:text-[72px] font-black leading-[1.02] tracking-[-0.5px] text-foreground m-0 uppercase">
                Apply for Early{' '}
                <span className="underline decoration-[3px] underline-offset-4">
                  Access
                </span>
                .
              </h1>
            </div>
            <div>
              <p className="font-body text-[19px] leading-[1.47] tracking-[0.108px] text-foreground m-0 mb-4">
                AI Companion Studio lets you build, configure, and converse with
                custom AI personas — all under your own API keys.
              </p>
              <p className="font-body text-[16px] leading-[1.5] text-muted-foreground m-0">
                Early access members shape the roadmap, get priority support,
                and lock in founding-member pricing before public launch.
              </p>
            </div>
          </div>

          {/* Stats ribbon */}
          <div className="mt-12 border-y-2 border-primary flex flex-col md:flex-row">
            {[
              { stat: '2,400+', label: 'APPLICATIONS RECEIVED' },
              { stat: '340',    label: 'SEATS REMAINING' },
              { stat: 'Q3 2026', label: 'NEXT COHORT OPENS' },
            ].map(({ stat, label }, i) => (
              <div
                key={label}
                className={cn(
                  "flex-1 py-5",
                  i < 2 && "md:border-r-2 md:border-primary",
                  i !== 0 && "md:pl-8 border-t-2 md:border-t-0 border-primary"
                )}
              >
                <div className="font-display text-[40px] font-black leading-none text-foreground mb-2">
                  {stat}
                </div>
                <div className="font-mono text-[11px] tracking-[1.1px] uppercase text-muted-foreground font-bold">
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
    <div className="mb-7">
      <Label className="font-mono text-[11px] tracking-[0.92px] uppercase text-foreground block mb-2.5 font-bold">
        {label}
      </Label>
      {children}
      {error && (
        <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

function FormSection({ form, set, errors, onSubmit, submitting }) {
  const inputClassName = (hasError) => cn(
    "font-mono text-[14px] border-2 rounded-none p-3 w-full bg-background text-foreground outline-none box-border transition-colors focus-visible:ring-0 h-[48px]",
    hasError ? "border-destructive focus-visible:border-destructive" : "border-primary focus-visible:border-foreground"
  );

  return (
    <section className="bg-background pb-20">
      <div className="max-w-[1280px] mx-auto px-8">

        {/* Section ribbon */}
        <div className="bg-foreground -mx-8 px-8 h-10 flex items-center">
          <span className="font-mono text-[12px] tracking-[1.2px] uppercase text-background font-bold">
            THE APPLICATION
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-16 pt-12">

          {/* Left: program details */}
          <aside>
            <div className="font-mono text-[11px] tracking-[1px] uppercase text-muted-foreground mb-4 font-bold">
              WHAT YOU GET
            </div>
            <div className="w-10 h-[2px] bg-foreground mb-6" />

            {[
              { heading: 'Full Platform Access', body: 'Every feature, every model integration, every config option — available from day one.' },
              { heading: 'Founding Member Pricing', body: 'Lock in a 40% discount off the public launch price for as long as you stay subscribed.' },
              { heading: 'Direct Roadmap Input', body: 'Monthly office hours and a private feedback channel. Your use case shapes what gets built next.' },
              { heading: 'Priority Support', body: 'Skip the queue. Early access members get a dedicated Slack channel with the core team.' },
            ].map(({ heading, body }, i) => (
              <div key={i} className="border-t-2 border-primary/20 py-5">
                <div className="font-mono text-[13px] font-bold text-foreground mb-2 tracking-[-0.1px] uppercase">
                  {heading}
                </div>
                <p className="font-body text-[14px] leading-[1.6] text-muted-foreground m-0">
                  {body}
                </p>
              </div>
            ))}

            <div className="border-t-2 border-primary/20 pt-6 mt-2">
              <div className="font-mono text-[11px] tracking-[1px] uppercase text-muted-foreground mb-3 font-bold">
                QUESTIONS?
              </div>
              <p className="font-body text-[13px] leading-[1.6] text-muted-foreground m-0">
                Email{' '}
                <a
                  href="mailto:early@aicompanionstudio.com"
                  className="text-foreground decoration-1 hover:text-primary transition-colors"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Full Name *" error={errors.name}>
                  <Input
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={inputClassName(!!errors.name)}
                  />
                </FormField>

                <FormField label="Email Address *" error={errors.email}>
                  <Input
                    type="email"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={inputClassName(!!errors.email)}
                  />
                </FormField>
              </div>

              <FormField label="Company / Organization" error={errors.company}>
                <Input
                  type="text"
                  placeholder="Optional — leave blank if personal use"
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                  className={inputClassName(false)}
                />
              </FormField>

              <FormField label="Primary Use Case *" error={errors.useCase}>
                <div className="relative">
                  <select
                    value={form.useCase}
                    onChange={e => set('useCase', e.target.value)}
                    className={cn(inputClassName(!!errors.useCase), "appearance-none cursor-pointer pr-10")}
                  >
                    {USE_CASES.map(v => (
                      <option key={v} value={v} disabled={v === ''}>
                        {v === '' ? 'Select a use case...' : v}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none font-mono text-[10px] text-muted-foreground">▼</div>
                </div>
              </FormField>

              <FormField label="Describe Your Use Case *" error={errors.description}>
                <textarea
                  placeholder="Tell us what you're building or how you plan to use AI Companion Studio. The more specific, the better — we use this to prioritize cohort invitations."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={5}
                  className={cn(inputClassName(!!errors.description), "resize-y min-h-[120px] h-auto p-4 leading-relaxed")}
                />
                <div className={cn("font-mono text-[10px] tracking-[0.5px] text-right mt-1.5 font-bold", form.description.length < 20 ? "text-muted-foreground" : "text-foreground")}>
                  {form.description.length} CHARS {form.description.length >= 20 ? '✓' : `(${20 - form.description.length} TO GO)`}
                </div>
              </FormField>

              <FormField label="How Did You Hear About Us?" error={errors.source}>
                <div className="relative">
                  <select
                    value={form.source}
                    onChange={e => set('source', e.target.value)}
                    className={cn(inputClassName(false), "appearance-none cursor-pointer pr-10")}
                  >
                    {SOURCES.map(v => (
                      <option key={v} value={v} disabled={v === ''}>
                        {v === '' ? 'Select an option...' : v}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none font-mono text-[10px] text-muted-foreground">▼</div>
                </div>
              </FormField>

              {/* Terms */}
              <div className={cn("mb-10 p-5 border-2", errors.agreed ? "border-destructive" : "border-primary")}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={e => set('agreed', e.target.checked)}
                    className="w-[18px] h-[18px] shrink-0 mt-[3px] cursor-pointer accent-foreground"
                  />
                  <span className="font-body text-[14px] leading-[1.6] text-foreground">
                    I have read and agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-foreground underline decoration-1 hover:text-primary transition-colors"
                    >
                      Terms of Service
                    </Link>{' '}
                    and acknowledge that my application data will be used to evaluate my request.
                  </span>
                </label>
                {errors.agreed && (
                  <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2 ml-[30px] font-bold">
                    {errors.agreed}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex flex-wrap items-center gap-6 border-t-2 border-foreground pt-7">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-none border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground font-mono text-[14px] font-bold tracking-[0.3em] uppercase py-6 px-9 gap-2 transition-all"
                >
                  {submitting ? 'SUBMITTING...' : <>SUBMIT APPLICATION <ArrowUpRight size={16} /></>}
                </Button>
                <span className="font-mono text-[11px] tracking-[0.7px] uppercase text-muted-foreground font-bold">
                  NO PAYMENT REQUIRED
                </span>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── What happens next ────────────────────────────────────────────────────────

function NextStepsSection() {
  return (
    <section className="bg-background border-t-2 border-foreground pb-20">
      <div className="max-w-[1280px] mx-auto px-8">

        {/* Ribbon header */}
        <div className="bg-foreground -mx-8 px-8 h-10 flex items-center mb-12">
          <span className="font-mono text-[12px] tracking-[1.2px] uppercase text-background font-bold">
            WHAT HAPPENS NEXT
          </span>
        </div>

        <div className="max-w-[800px]">
          {STEPS.map(({ num, heading, body }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
              className={cn(
                "border-t-2 border-primary py-7 grid grid-cols-[80px_1fr] gap-8 items-start",
                i === STEPS.length - 1 && "border-b-2 border-primary"
              )}
            >
              <div className="font-display text-[48px] font-black leading-none text-muted-foreground select-none">
                {num}
              </div>
              <div>
                <div className="font-mono text-[17px] font-bold tracking-[-0.144px] text-foreground mb-2.5 uppercase">
                  {heading}
                </div>
                <p className="font-body text-[16px] leading-[1.5] tracking-[0.09px] text-muted-foreground m-0">
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
    <footer className="bg-foreground text-background pt-14 px-8 pb-10">
      <div className="max-w-[1280px] mx-auto">

        {/* Logo row */}
        <div className="flex items-center gap-3 mb-12 pb-8 border-b border-background/20">
          <div className="w-6 h-6 bg-background flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="ACS" className="w-full object-contain" onError={e => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <span className="font-display text-[13px] font-black text-background tracking-[0.05em] uppercase">
            AI COMPANION STUDIO
          </span>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <div className="font-mono text-[11px] tracking-[1.1px] uppercase text-background mb-5 font-bold">
                {heading}
              </div>
              <div className="flex flex-col gap-3">
                {links.map(link => (
                  <a
                    key={link}
                    href="#"
                    className="font-mono text-[11px] font-bold text-background/60 no-underline tracking-[0.3em] uppercase transition-colors hover:text-primary"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/20 pt-6 flex justify-between items-center flex-wrap gap-3">
          <span className="font-mono text-[11px] font-bold text-background/60 tracking-[0.2px] uppercase">
            © 2026 AI Companion Studio. MIT License.
          </span>
          <Link
            to="/apply"
            className="font-mono text-[11px] tracking-[0.9px] uppercase text-background no-underline hover:text-primary font-bold transition-colors"
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
    if (!form.name.trim()) e.name = 'FULL NAME IS REQUIRED.';
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = 'A VALID EMAIL ADDRESS IS REQUIRED.';
    if (!form.useCase) e.useCase = 'PLEASE SELECT A USE CASE.';
    if (form.description.trim().length < 20)
      e.description = 'PLEASE DESCRIBE YOUR USE CASE (MINIMUM 20 CHARACTERS).';
    if (!form.agreed) e.agreed = 'YOU MUST AGREE TO THE TERMS OF SERVICE.';
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
    <div className="bg-background text-foreground min-h-screen">
      <UtilityBar />
      <MainNav />
      <HeroSection />
      <FormSection form={form} set={set} errors={errors} onSubmit={handleSubmit} submitting={submitting} />
      <NextStepsSection />
      <Footer />
    </div>
  );
}
