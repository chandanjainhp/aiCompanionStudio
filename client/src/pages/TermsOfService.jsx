import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-primary bg-background/90 backdrop-blur-md">
        <div className="max-w-[800px] mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            to="/register"
            className="h-8 px-3 border-2 border-primary flex items-center justify-center hover:bg-muted/20 transition-colors font-mono text-[10px] font-bold tracking-[0.1em] uppercase gap-2"
          >
            <ArrowLeft size={12} />
            BACK
          </Link>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            TERMS &amp; PRIVACY POLICY
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-6 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="mb-12 pb-8 border-b-2 border-primary">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] font-bold opacity-60 mb-6">
              LEGAL DOCUMENT
            </div>
            <h1 className="font-display text-[48px] sm:text-[64px] font-black leading-[1.05] mb-4 tracking-tight uppercase">
              TERMS &amp; <br/><span className="text-muted-foreground">PRIVACY POLICY</span>
            </h1>
            <div className="font-mono text-[11px] text-muted-foreground tracking-[0.05em] uppercase">
              Last updated: January 2026
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {sections.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="bg-muted/20 border-2 border-primary p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start"
              >
                <div className="font-display text-[32px] sm:text-[40px] font-black leading-none text-primary flex-shrink-0 select-none">
                  {s.num}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[13px] font-bold tracking-[0.1em] uppercase mb-4 text-foreground">
                    {s.title}
                  </div>
                  {s.list ? (
                    <>
                      <p className="font-body text-[14px] text-muted-foreground leading-relaxed mb-4">
                        We prioritize your data privacy. When using our OpenRoute API integration:
                      </p>
                      <ul className="flex flex-col gap-3">
                        {s.list.map((item, j) => (
                          <li key={j} className="flex gap-3 items-start">
                            <span className="text-primary font-bold mt-0.5">→</span>
                            <span className="font-body text-[14px] text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="font-body text-[14px] text-muted-foreground leading-relaxed">{s.body}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-12 pt-8 border-t-2 border-primary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase font-bold">
              AI COMPANION STUDIO · MIT LICENSE
            </span>
            <Link
              to="/register"
              className="font-mono text-[11px] font-bold text-foreground hover:text-primary tracking-[0.1em] uppercase underline hover:no-underline transition-colors"
            >
              BACK TO REGISTER →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
