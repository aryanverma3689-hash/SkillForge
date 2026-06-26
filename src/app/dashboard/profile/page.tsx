"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const techRoles = [
  "AI Engineer", "Android Developer", "Backend Developer", "Blockchain Developer",
  "Cloud Architect", "Computer Vision Engineer", "Cybersecurity Analyst", "Data Analyst", 
  "Data Engineer", "Data Scientist", "DevOps Engineer", "Frontend Developer", 
  "Full Stack Developer", "Game Developer", "iOS Developer", "Machine Learning Engineer", 
  "Mobile Developer", "Network Engineer", "Product Manager", "QA Engineer", 
  "Software Engineer", "Systems Administrator", "UI/UX Designer", "Web Developer"
];

export default function ProfilePage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setSkills(parsed.skills || []);
      setTargetRole(parsed.targetRole || "");
      setExperience(parsed.experience || "");
    }
    setIsLoaded(true);
  }, []);

  // Auto-save basic profile details locally when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("skillforge_profile", JSON.stringify({ targetRole, skills, experience }));
    }
  }, [targetRole, skills, experience, isLoaded]);
  
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const filteredRoles = techRoles.filter(role => role.toLowerCase().includes(targetRole.toLowerCase()));

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

  const saveProfile = async () => {
    try {
      setIsAnalyzing(true);
      
      const oldProfileStr = localStorage.getItem("skillforge_profile");
      const oldProfile = oldProfileStr ? JSON.parse(oldProfileStr) : null;
      const roleChanged = !oldProfile || oldProfile.targetRole !== targetRole;

      // Save basic profile to local storage
      localStorage.setItem("skillforge_profile", JSON.stringify({ targetRole, skills, experience }));

      // Call our AI endpoint
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
      
      // Save analysis results
      localStorage.setItem("skillforge_analysis", JSON.stringify(analysis));
      
      if (roleChanged) {
        localStorage.removeItem("skillforge_roadmap");
        localStorage.removeItem("skillforge_progress");
        localStorage.removeItem("skillforge_topic_progress");
        localStorage.removeItem("skillforge_resources");
        localStorage.removeItem("skillforge_projects");
      }
      
      // Navigate to the skills gap page to view results
      router.push("/dashboard/skills");
    } catch (error: any) {
      console.error(error);
      alert(`Error analyzing profile: ${error.message}\nMake sure your API key is in .env`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Update your details to get accurate skill gap analysis and roadmaps.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm relative z-50">
          <h2 className="text-xl font-semibold mb-4">Target Role</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">What role are you aiming for?</label>
            <div className="relative">
              <input 
                type="text" 
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setShowRoleDropdown(true);
                }}
                onFocus={() => setShowRoleDropdown(true)}
                onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm"
                placeholder="e.g. Data Scientist, AI Engineer, MLOps"
              />
              
              {showRoleDropdown && filteredRoles.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-hidden">
                  {filteredRoles.map(role => (
                    <div 
                      key={role}
                      className="px-4 py-3 hover:bg-primary hover:text-primary-foreground cursor-pointer text-foreground transition-colors"
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
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Skills</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-primary/70 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm"
              placeholder="Add a skill (e.g. TensorFlow, React)..."
            />
            <button 
              onClick={handleAddSkill}
              className="w-full sm:w-auto px-5 py-3 bg-muted border border-border text-foreground hover:bg-muted/80 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Experience & Projects */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Experience & Projects</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Briefly describe your experience</label>
              <textarea 
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none shadow-sm"
                placeholder="Where have you worked? What have you built?"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={saveProfile}
            disabled={isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 sm:py-3 rounded-xl font-semibold transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isAnalyzing ? "Analyzing Profile & AI Scoring..." : "Save & Analyze Profile"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
