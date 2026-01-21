import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link to="/register">
                        <Button variant="ghost" className="text-white/60 hover:text-white pl-0 hover:bg-transparent">
                            <ArrowBackIcon sx={{ fontSize: 20 }} className="mr-2" />
                            Back to Registration
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-8">
                        Terms & Privacy Policy
                    </h1>

                    <div className="space-y-8 text-white/70 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
                            <p>
                                Welcome to AI Companion Studio. By creating an account and using our services, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. Data Privacy & AI Models</h2>
                            <p className="mb-4">
                                We prioritize your data privacy. When using our OpenRoute API integration:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Your prompts and conversations are processed securely.</li>
                                <li>We do not use your personal data to train public AI models without your explicit consent.</li>
                                <li>You retain ownership of the content you generate.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. User Responsibilities</h2>
                            <p>
                                You agree not to use the platform to generate harmful, illegal, or abusive content. We reserve the right to suspend accounts that violate our usage policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. OpenRoute API Usage</h2>
                            <p>
                                This application utilizes the OpenRoute API for AI inference. Usage is subject to OpenRoute's API terms of service and usage limits associated with your account tier.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. Updates to Terms</h2>
                            <p>
                                We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-white/10 text-sm text-white/40">
                            Last updated: January 2026
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
