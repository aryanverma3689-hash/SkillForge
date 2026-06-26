"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Code, Star, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    const savedAnalysis = localStorage.getItem("skillforge_analysis");
    const savedProjects = localStorage.getItem("skillforge_projects");
    const savedCompleted = localStorage.getItem("skillforge_completed_projects");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedCompleted) setCompletedProjects(JSON.parse(savedCompleted));
  }, []);

  const generateProjects = async () => {
    if (!profile || !analysis) return;
    
    try {
      setIsGenerating(true);
      const response = await fetch("/api/recommend-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetRole: profile.targetRole, 
          missingSkills: analysis.missingSkills 
        })
      });

      if (!response.ok) throw new Error("Failed to generate projects");

      const data = await response.json();
      setProjects(data.projects);
      localStorage.setItem("skillforge_projects", JSON.stringify(data.projects));
    } catch (error) {
      console.error(error);
      alert("Error generating projects. Make sure your API key is in .env");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!profile || !analysis) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground">No Profile Data Found</h2>
        <p className="text-muted-foreground mb-6 font-medium">Analyze your skills first to get personalized project recommendations.</p>
        <button onClick={() => router.push("/dashboard/skills")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors shadow-sm font-semibold">
          Go to Skill Gap
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Project Recommendations</h1>
          <p className="text-muted-foreground font-medium">Interview-worthy projects to master your missing skills.</p>
        </div>
        <button 
          onClick={generateProjects}
          disabled={isGenerating}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 text-primary-foreground shadow-sm"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
          {projects.length > 0 ? "Regenerate" : "Generate Projects"}
        </button>
      </div>

      {projects.length === 0 && !isGenerating && (
        <div className="text-center p-12 bg-card border border-border rounded-3xl shadow-sm">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-foreground">Ready to Build?</h3>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            Click the generate button above to get personalized project ideas tailored to your missing skills for the <span className="text-foreground">{profile.targetRole}</span> role.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index} 
            className="bg-card border border-border rounded-3xl p-6 flex flex-col hover:border-primary/50 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <span className={`text-xs px-3 py-1.5 font-bold rounded-full border ${
                project.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                project.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {project.difficulty}
              </span>
            </div>
            
            <h2 className="text-xl font-bold mb-2 text-foreground">{project.title}</h2>
            <p className="text-muted-foreground text-sm mb-6 flex-grow font-medium leading-relaxed">{project.description}</p>
            
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-primary" /> Skills Targeted
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.skillsGained.map((skill: string, idx: number) => (
                  <span key={idx} className="text-xs px-2.5 py-1 bg-muted border border-border text-foreground font-semibold rounded-md shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
