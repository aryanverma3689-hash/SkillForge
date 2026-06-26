"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Target, CheckCircle2, AlertTriangle, FileSignature, Network, X, TrendingUp, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ATSAnalyzerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [completedTopicNames, setCompletedTopicNames] = useState<string[]>([]);
  
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedRoadmap = localStorage.getItem("skillforge_roadmap");
    const savedTopics = localStorage.getItem("skillforge_topic_progress");
    const savedProgress = localStorage.getItem("skillforge_progress");

    let topicNames: string[] = [];
    if (savedRoadmap) {
      try {
        const roadmap = JSON.parse(savedRoadmap);
        const completed = savedTopics ? JSON.parse(savedTopics) : {};
        const currentWeekIndex = savedProgress ? parseInt(savedProgress, 10) : 0;
        
        if (roadmap?.weeks) {
          for (let w = 0; w < roadmap.weeks.length; w++) {
            for (let t = 0; t < roadmap.weeks[w].topics.length; t++) {
              if (completed[`${w}-${t}`] || w < currentWeekIndex) {
                 topicNames.push(roadmap.weeks[w].topics[t]);
              }
            }
          }
        }
      } catch (e) {}
    }
    setCompletedTopicNames(topicNames);
  }, []);

  const analyzeJD = async () => {
    if (!jobDescription.trim() || !profile) return;
    
    setIsAnalyzing(true);
    setResults(null);

    try {
      const response = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("skillforge_api_key") ? { "x-api-key": localStorage.getItem("skillforge_api_key") as string } : {})
        },
        body: JSON.stringify({ 
          jobDescription,
          userProfile: {
            ...profile,
            skills: [...(profile?.skills || []), ...completedTopicNames]
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to analyze job description");
      }

      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      console.error(error);
      alert(`Error analyzing Job Description: ${error.message || "Please check your API key"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Profile Required</h2>
        <p className="text-muted-foreground mb-6 font-medium">You need to set up your profile first so we can match you against job descriptions.</p>
        <button onClick={() => router.push("/dashboard/profile")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors shadow-sm font-semibold">
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Job Match</h1>
        <p className="text-muted-foreground font-medium">Paste a Job Description to get advanced insights on your skill gap, benchmarks, and potential salary.</p>
      </div>

      {/* Input Section */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-primary" /> Job Description
        </h2>
        <p className="text-sm text-muted-foreground mb-4 font-medium">Copy and paste the full job description from LinkedIn, Indeed, or the company website.</p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste JD here..."
          className="w-full h-48 bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-colors resize-none"
        />
        
        <button 
          onClick={analyzeJD}
          disabled={isAnalyzing || !jobDescription.trim()}
          className="w-full md:w-auto mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
          {isAnalyzing ? "Analyzing Match..." : "Analyze Job Match"}
        </button>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
          {!results && !isAnalyzing && (
            <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Target className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground">Awaiting Job Description</h3>
              <p className="text-muted-foreground mt-2 font-medium">Paste a JD on the left and click analyze to see your results.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-bold text-foreground">Scanning Keywords...</h3>
              <p className="text-muted-foreground mt-2 font-medium">Comparing your profile against ATS requirements.</p>
            </div>
          )}

          {results && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border shadow-sm rounded-3xl p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1 text-foreground">Match Score</h2>
                    <p className="text-sm text-muted-foreground font-medium">Against Job Description</p>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0 ml-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted" />
                      <circle 
                        cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray="201.1" 
                        strokeDashoffset={201.1 - (201.1 * results.matchScore) / 100}
                        className={results.matchScore > 75 ? "text-emerald-500" : results.matchScore > 50 ? "text-yellow-500" : "text-red-500"} 
                      />
                    </svg>
                    <span className="absolute text-lg font-extrabold text-foreground">{Math.round(results.matchScore)}%</span>
                  </div>
                </div>

                {results.recommendedLearningTime && (
                  <div className="bg-card border border-border shadow-sm rounded-3xl p-6 flex flex-col justify-center">
                    <div className="mb-2">
                      <h2 className="text-xl font-bold mb-1 text-foreground">Learning Time</h2>
                      <p className="text-sm text-muted-foreground font-medium">To acquire missing skills</p>
                    </div>
                    <div className="text-3xl font-extrabold text-primary">
                      {results.recommendedLearningTime}
                    </div>
                  </div>
                )}
              </div>

              {/* Industry Benchmark */}
              {results.industryBenchmark && (
                <div className="bg-card border border-border shadow-sm rounded-3xl p-8">
                   <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                     <Target className="w-5 h-5 text-indigo-500" /> Industry Benchmark
                   </h2>
                   <p className="text-sm text-muted-foreground mb-6 font-medium">See where you stand among others for the <span className="font-bold text-foreground">{results.industryBenchmark.role}</span> role.</p>
                   
                   <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 p-6 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between shadow-sm mb-6">
                      <div className="mb-4 sm:mb-0 text-center sm:text-left">
                        <h4 className="font-bold text-xs text-muted-foreground mb-1 uppercase tracking-wider">Your Estimated Ranking</h4>
                        <p className="text-sm font-medium text-foreground">Based on your current skill set</p>
                      </div>
                      <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">{results.industryBenchmark.userRanking}</div>
                   </div>

                   <div className="bg-muted/50 p-6 rounded-2xl border border-border shadow-inner">
                      <h4 className="font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Top 10% Candidate Skills</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {results.industryBenchmark.topPercentileSkills?.map((s: string, i: number) => (
                           <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/> <span className="truncate">{s}</span>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {/* Skills Tree */}
              {results.skillsTree && (
                <div className="bg-card border border-border shadow-sm rounded-3xl p-8">
                   <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                     <Network className="w-5 h-5 text-emerald-500" /> Skills Tree
                   </h2>
                   <div className="space-y-8">
                     {results.skillsTree.map((category: any, idx: number) => (
                        <div key={idx}>
                           <h3 className="text-lg font-bold text-foreground mb-4 bg-muted inline-block px-4 py-1.5 rounded-lg text-sm">{category.category}</h3>
                           <div className="pl-6 border-l-2 border-muted space-y-4 ml-2">
                              {category.skills?.map((skill: any, sIdx: number) => (
                                 <div key={sIdx} className="flex items-center gap-4 relative group">
                                    <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-6 h-[2px] bg-muted group-hover:bg-primary/50 transition-colors"></div>
                                    {skill.acquired ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 shadow-sm rounded-full" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 shadow-sm">
                                        <X className="w-3 h-3 text-red-500" />
                                      </div>
                                    )}
                                    <span className={`text-sm font-semibold ${skill.acquired ? "text-foreground" : "text-muted-foreground line-through decoration-red-500/30"}`}>{skill.name}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                   </div>
                </div>
              )}

              {/* Salary Projection */}
              {results.salaryProjection && (
                <div className="bg-card border border-border shadow-sm rounded-3xl p-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-32 bg-green-500/5 blur-[100px] rounded-full pointer-events-none" />
                   <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2 relative z-10">
                     <TrendingUp className="w-5 h-5 text-green-500" /> Salary Projection
                   </h2>
                   <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                     <div className="flex-1 w-full p-6 bg-muted/50 rounded-2xl border border-border text-center shadow-inner">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Current Value</p>
                        <p className="text-2xl font-black text-foreground">{results.salaryProjection.current}</p>
                     </div>
                     <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-full flex items-center justify-center -my-2 md:-mx-4 z-20 border-4 border-card shadow-sm">
                        <ArrowRight className="w-6 h-6 text-primary rotate-90 md:rotate-0" />
                     </div>
                     <div className="flex-1 w-full p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl border border-green-500/20 text-center shadow-sm">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">After Learning</p>
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">{results.salaryProjection.potential}</p>
                     </div>
                   </div>
                </div>
              )}

              {/* Tailored Cover Letter */}
              <div className="bg-card border border-border shadow-sm rounded-3xl p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <FileSignature className="w-5 h-5 text-sky-500" /> Tailored Cover Letter
                </h2>
                <div className="bg-muted/50 border border-border rounded-xl p-6 shadow-inner">
                  <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-serif">
                    {results.coverLetter}
                  </p>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(results.coverLetter)}
                  className="mt-6 w-full py-3 bg-muted hover:bg-muted/80 border border-border shadow-sm rounded-xl text-sm font-bold text-foreground transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>

            </motion.div>
          )}
        </div>
    </div>
  );
}
