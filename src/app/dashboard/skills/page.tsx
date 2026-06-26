"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SkillGapPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    const savedAnalysis = localStorage.getItem("skillforge_analysis");
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
  }, []);

  const generateRoadmap = async () => {
    if (!profile || !analysis) return;
    
    try {
      setIsGenerating(true);
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetRole: profile.targetRole, 
          missingSkills: analysis.missingSkills 
        })
      });

      const roadmap = await response.json();
      
      if (!response.ok) {
        throw new Error(roadmap.details || roadmap.error || "Failed to generate roadmap");
      }
      
      // Clear old progress and generated resources/projects for the new roadmap
      localStorage.removeItem("skillforge_progress");
      localStorage.removeItem("skillforge_resources");
      localStorage.removeItem("skillforge_projects");
      
      localStorage.setItem("skillforge_roadmap", JSON.stringify(roadmap));
      router.push("/dashboard/roadmap");
    } catch (error: any) {
      console.error(error);
      alert(`Error generating roadmap: ${error.message}\nMake sure your API key is in .env`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile || !analysis) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-semibold mb-4">No Profile Data Found</h2>
        <p className="text-muted-foreground mb-6">Please set up your profile and save it to generate an analysis.</p>
        <button onClick={() => router.push("/dashboard/profile")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors shadow-sm font-semibold">
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Skill Gap Analysis</h1>
          <p className="text-muted-foreground">Target Role: <span className="text-foreground font-semibold">{profile.targetRole}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1 font-medium">Match Score</p>
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-500">
            {analysis.matchScore}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Acquired Skills */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Matched Skills</h2>
          </div>
          <ul className="space-y-4">
            {analysis.matchedSkills?.map((skill: string, i: number) => (
              <li key={i} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border shadow-sm">
                <span className="font-semibold text-foreground">{skill}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">Acquired</span>
              </li>
            ))}
            {(!analysis.matchedSkills || analysis.matchedSkills.length === 0) && (
              <p className="text-muted-foreground text-sm font-medium">No specific matched skills found for this role yet.</p>
            )}
          </ul>
        </motion.div>

        {/* Missing Skills */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <AlertCircle className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Missing Skills</h2>
          </div>
          <ul className="space-y-4 relative z-10">
            {analysis.missingSkills?.map((skill: string, i: number) => (
              <li key={i} className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
                <span className="font-semibold text-foreground">{skill}</span>
                <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">Required</span>
              </li>
            ))}
            {(!analysis.missingSkills || analysis.missingSkills.length === 0) && (
              <p className="text-emerald-500 text-sm font-semibold">You have all the required skills for this role! Great job.</p>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Recommended Roadmap Trigger */}
      {analysis.missingSkills && analysis.missingSkills.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-8 bg-gradient-to-r from-primary/10 to-background border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Ready to close the gap?</h3>
            <p className="text-muted-foreground font-medium">Generate a personalized weekly learning roadmap based on these missing skills.</p>
          </div>
          <button 
            onClick={generateRoadmap}
            disabled={isGenerating}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 whitespace-nowrap disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isGenerating ? "Generating AI Roadmap..." : "Generate Roadmap"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
