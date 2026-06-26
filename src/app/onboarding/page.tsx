"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Loader2, Sparkles, Target, Zap, Rocket, X } from "lucide-react";

const techRoles = [
  "AI Engineer", "Android Developer", "Backend Developer", "Blockchain Developer",
  "Cloud Architect", "Computer Vision Engineer", "Cybersecurity Analyst", "Data Analyst", 
  "Data Engineer", "Data Scientist", "DevOps Engineer", "Frontend Developer", 
  "Full Stack Developer", "Game Developer", "iOS Developer", "Machine Learning Engineer", 
  "Mobile Developer", "Network Engineer", "Product Manager", "QA Engineer", 
  "Software Engineer", "Systems Administrator", "UI/UX Designer", "Web Developer"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const filteredRoles = techRoles.filter(role => role.toLowerCase().includes(targetRole.toLowerCase()));

  // If a profile already exists, redirect to dashboard
  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (savedProfile) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 0));

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter" || e.type === "click") && newSkill.trim()) {
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const finishOnboarding = async () => {
    try {
      setIsProcessing(true);
      setStep(4); // Move to processing step visually
      
      // Save basic profile to local storage
      localStorage.setItem("skillforge_profile", JSON.stringify({ targetRole, skills, experience }));

      // Call AI endpoint to analyze skills and generate baseline
      const response = await fetch("/api/analyze-skills", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("skillforge_api_key") ? { "x-api-key": localStorage.getItem("skillforge_api_key") as string } : {})
        },
        body: JSON.stringify({ targetRole, currentSkills: skills, experience })
      });

      const analysis = await response.json();

      if (!response.ok) {
        throw new Error(analysis.details || analysis.error || "Failed to analyze skills");
      }
      
      localStorage.setItem("skillforge_analysis", JSON.stringify(analysis));
      
      // Redirect to the dashboard to see their overview
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      alert(`Error setting up profile: ${error.message}\nMake sure your API key is in Settings!`);
      setStep(3); // Go back to experience step if failed
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    {
      title: "Welcome to SkillForge",
      subtitle: "Your AI-powered career accelerator.",
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            We are going to build a personalized roadmap tailored specifically to your dream role. Let's start by getting to know you.
          </p>
          <button 
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )
    },
    {
      title: "What's your goal?",
      subtitle: "Tell us the role you're aiming for.",
      content: (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
            <Target className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="relative z-50">
            <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Target Role</label>
            <input 
              type="text" 
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                setShowRoleDropdown(true);
              }}
              onFocus={() => setShowRoleDropdown(true)}
              onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
              className="w-full bg-background border-2 border-border rounded-2xl px-5 py-4 text-lg text-foreground focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              placeholder="e.g. Machine Learning Engineer"
            />
            
            {showRoleDropdown && filteredRoles.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-hidden">
                {filteredRoles.map(role => (
                  <div 
                    key={role}
                    className="px-5 py-3 hover:bg-indigo-500 hover:text-white cursor-pointer text-foreground transition-colors font-medium"
                    onClick={() => {
                      setTargetRole(role);
                      setShowRoleDropdown(false);
                    }}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4 relative z-40">
            <button onClick={handlePrev} className="px-6 py-4 rounded-2xl border-2 border-border text-foreground hover:bg-muted font-bold transition-colors">Back</button>
            <button 
              onClick={handleNext} 
              disabled={!targetRole}
              className="flex-1 px-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )
    },
    {
      title: "What do you already know?",
      subtitle: "Add your current skills so we don't teach you what you already know.",
      content: (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
            <Zap className="w-8 h-8 text-emerald-500" />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2 min-h-[48px]">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-bold shadow-sm">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-emerald-800 transition-colors bg-emerald-500/20 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {skills.length === 0 && <span className="text-muted-foreground text-sm flex items-center italic">No skills added yet.</span>}
          </div>

          <div className="flex gap-3">
            <input 
              type="text" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 bg-background border-2 border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              placeholder="e.g. Python, React..."
            />
            <button 
              onClick={handleAddSkill}
              className="px-6 py-4 bg-muted border-2 border-border text-foreground hover:bg-muted/80 rounded-2xl transition-colors font-bold shadow-sm"
            >
              Add
            </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={handlePrev} className="px-6 py-4 rounded-2xl border-2 border-border text-foreground hover:bg-muted font-bold transition-colors">Back</button>
            <button 
              onClick={handleNext} 
              className="flex-1 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 flex justify-center items-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Any experience?",
      subtitle: "Briefly describe past projects or roles.",
      content: (
        <div className="space-y-6">
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/20">
            <Rocket className="w-8 h-8 text-sky-500" />
          </div>
          
          <textarea 
            rows={4}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full bg-background border-2 border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-sky-500 transition-colors resize-none shadow-inner text-lg"
            placeholder="Built a sentiment analysis bot, worked 1 year as a Junior Dev..."
          />

          <div className="flex gap-4 pt-4">
            <button onClick={handlePrev} className="px-6 py-4 rounded-2xl border-2 border-border text-foreground hover:bg-muted font-bold transition-colors">Back</button>
            <button 
              onClick={finishOnboarding} 
              disabled={isProcessing}
              className="flex-1 px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              Finish Setup <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Building your Profile...",
      subtitle: "AI is analyzing your skills and generating a custom roadmap.",
      content: (
        <div className="flex flex-col items-center text-center space-y-8 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="w-20 h-20 text-primary animate-spin relative z-10" />
          </div>
          <div className="space-y-2">
             <p className="text-xl font-bold text-foreground animate-pulse">Forging your career path</p>
             <p className="text-sm text-muted-foreground font-medium">This usually takes 10-15 seconds.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10">
        
        {/* Progress Bar (hidden on processing and welcome step) */}
        {step > 0 && step < 4 && (
          <div className="w-full bg-muted rounded-full h-2.5 mb-12 overflow-hidden border border-border/50">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${((step) / 3) * 100}%` }}
            >
               <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-card border border-border shadow-2xl rounded-[2rem] p-8 md:p-12"
          >
            <div className="mb-8">
               <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">{steps[step].title}</h1>
               <p className="text-muted-foreground font-medium text-lg">{steps[step].subtitle}</p>
            </div>
            
            {steps[step].content}
            
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
