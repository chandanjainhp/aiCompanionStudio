import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import CodeIcon from '@mui/icons-material/Code';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: PsychologyIcon,
            title: 'Context Aware',
            description: 'Agents maintain long-term memory of your projects and preferences for personalized assistance.',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            icon: BoltIcon,
            title: 'High Performance',
            description: 'Optimized interactions with minimal latency, powered by advanced modern architecture.',
            gradient: 'from-yellow-500 to-orange-500',
        },
        {
            icon: SecurityIcon,
            title: 'Private & Secure',
            description: 'Your data and conversations remain private. Option for local model execution for complete control.',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: CodeIcon,
            title: 'Project Organization',
            description: 'Group conversations into projects. Manage context and artifacts efficiently.',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            icon: LanguageIcon,
            title: 'Knowledge Base',
            description: 'Upload documents and documentation to give your AI agents specific domain knowledge.',
            gradient: 'from-indigo-500 to-purple-500',
        },
        {
            icon: RocketLaunchIcon,
            title: 'Seamless Workflow',
            description: 'Integrated tools for code generation, text editing, and creative brainstorming.',
            gradient: 'from-red-500 to-pink-500',
        },
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0B0F1A] text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[128px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-bold text-xl">AI Companion Studio</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-white/80 hover:text-white">
                                Sign In
                            </Button>
                        </Link>
                        <a href="https://github.com/chandanjainhp/aiCompanionStudio" target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" className="text-white/80 hover:text-white gap-2">
                                <GitHubIcon sx={{ fontSize: 20 }} />
                                <span className="hidden sm:inline">Star on GitHub</span>
                            </Button>
                        </a>
                        <Link to="/register">
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
                                Get Started
                                <ArrowForwardIcon sx={{ fontSize: 16 }} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                style={{ y, opacity }}
                className="relative min-h-screen flex items-center justify-center px-6 pt-16"
            >
                {/* 3D Floating Elements */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        x: mousePosition.x,
                        y: mousePosition.y,
                    }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    style={{
                        x: -mousePosition.x,
                        y: -mousePosition.y,
                    }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/30 to-pink-500/30 rounded-3xl blur-2xl"
                />

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
                    >
                        <AutoAwesomeIcon sx={{ fontSize: 16 }} className="text-blue-400" />
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-300 uppercase tracking-wide mr-2">New</span>
                        <span className="text-sm font-medium text-white/80">Powered by Advanced AI OpenRoute API</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent leading-tight"
                    >
                        Custom AI Agents
                        <br />
                        For Your Workflow
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Design, train, and deploy specialized AI companions tailored to your specific needs. From coding assistants to creative writing partners, build the perfect AI for every task.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/register">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-blue-500/25">
                                Start Building Free
                                <ArrowForwardIcon sx={{ fontSize: 20 }} className="ml-2" />
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 text-lg rounded-xl">
                                View Demo
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
                    >
                        {[
                            { value: 'Multiple', label: 'LLM Models' },
                            { value: 'Secure', label: 'Local Execution' },
                            { value: 'Infinite', label: 'Possibilities' },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Powerful features designed for modern AI applications
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon sx={{ fontSize: 28, color: 'white' }} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed">{feature.description}</p>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Get Started?
                            </h2>
                            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                                Start Creating Now
                            </p>
                            <Link to="/register">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 px-8 py-6 text-lg rounded-xl font-semibold">
                                    Create Your Free Account
                                    <ArrowForwardIcon sx={{ fontSize: 20 }} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center text-white/50">
                    <p>© 2026 AI Companion Studio. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
