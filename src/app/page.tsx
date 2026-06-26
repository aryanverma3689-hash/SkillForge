"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Target, BookOpen, ChevronRight, FileText, MessageSquare, PlaySquare } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30 font-sans transition-colors duration-500 relative">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none transition-opacity duration-1000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none transition-opacity duration-1000" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">SkillForge</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/onboarding" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/onboarding" className="text-sm font-semibold bg-foreground text-background px-6 py-2.5 rounded-full hover:bg-foreground/90 hover:scale-105 transition-all shadow-md">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto mt-20 md:mt-32">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="flex flex-col items-center gap-8"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Meet Your AI Career Coach
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Stop Guessing. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">
              Start Building Your Career.
            </span>
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-2 leading-relaxed">
            SkillForge analyzes your profile, identifies skill gaps, and generates a personalized roadmap to land your dream role.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/onboarding" className="group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5">
              Analyze My Profile
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="flex items-center justify-center gap-2 bg-card hover:bg-card/80 text-foreground px-8 py-4 rounded-full text-lg font-medium transition-all border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5">
              View Features
            </a>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 pb-20 w-full"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              variants={fadeIn}
              className="flex flex-col items-start p-8 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                {feature.description}
              </p>
              <div className="flex items-center text-primary text-sm font-semibold mt-auto group-hover:tracking-wide transition-all">
                Explore Feature <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

const features = [
  {
    title: "Skill Gap Analysis",
    description: "Compare your current skills against industry requirements for any role. Get an exact match score and know what you're missing.",
    icon: <Target className="w-6 h-6 text-primary" />
  },
  {
    title: "Personalized Roadmap",
    description: "Ditch generic advice. We generate a week-by-week learning plan tailored to your available time and target career.",
    icon: <BookOpen className="w-6 h-6 text-sky-500" />
  },
  {
    title: "AI Resume Builder",
    description: "Instantly generate ATS-friendly resumes optimized with keywords specifically for the job title you are targeting.",
    icon: <FileText className="w-6 h-6 text-emerald-500" />
  },
  {
    title: "Mock Interviews",
    description: "Practice behavioral and technical questions in realistic, role-playing scenarios graded by our AI.",
    icon: <MessageSquare className="w-6 h-6 text-purple-500" />
  },
  {
    title: "24/7 AI Mentor",
    description: "Meet Nova, your personal career coach. Ask questions, get code reviewed, and receive personalized guidance anytime.",
    icon: <BrainCircuit className="w-6 h-6 text-pink-500" />
  },
  {
    title: "Smart Resources",
    description: "Stop searching. We automatically find the best free courses, YouTube tutorials, and articles for every topic you need to learn.",
    icon: <PlaySquare className="w-6 h-6 text-amber-500" />
  }
];
