"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Target, Trophy, Clock, ArrowRight, UserCircle, Network, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DashboardOverview() {
  const [profile, setProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    const savedAnalysis = localStorage.getItem("skillforge_analysis");
    const savedRoadmap = localStorage.getItem("skillforge_roadmap");
    const savedProgress = localStorage.getItem("skillforge_progress");
    const savedProjects = localStorage.getItem("skillforge_projects");
    const savedCompleted = localStorage.getItem("skillforge_completed_projects");
    const savedTopics = localStorage.getItem("skillforge_topic_progress");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
    if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
    if (savedProgress) setCurrentWeekIndex(parseInt(savedProgress, 10));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedCompleted) setCompletedProjects(JSON.parse(savedCompleted));
    if (savedTopics) setCompletedTopics(JSON.parse(savedTopics));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const totalWeeks = roadmap?.weeks?.length || 1;
  const progressPercent = roadmap ? Math.round((currentWeekIndex / totalWeeks) * 100) : 0;
  
  const safeIndex = roadmap ? Math.min(currentWeekIndex, (roadmap?.weeks?.length || 1) - 1) : 0;
  const currentWeekTitle = roadmap?.weeks?.[safeIndex]?.title || "Generate a roadmap first";
  const currentTopic = roadmap?.weeks?.[safeIndex]?.topics?.[0] || "No topics available";

  const originalScore = analysis?.score || 0;
  const currentScore = Math.min(100, Math.round(originalScore + ((100 - originalScore) * (progressPercent / 100))));
  const originalMissingCount = analysis?.missingSkills?.length || 0;
  const currentMissingCount = Math.round(originalMissingCount * (1 - progressPercent / 100));

  // Calculate completed and next topics for Nova's greeting
  let recentlyCompleted: string[] = [];
  let nextUp: string[] = [];
  
  if (roadmap?.weeks) {
    for (let w = 0; w < roadmap.weeks.length; w++) {
      for (let t = 0; t < roadmap.weeks[w].topics.length; t++) {
        const topicName = roadmap.weeks[w].topics[t];
        if (completedTopics[`${w}-${t}`] || w < currentWeekIndex) {
          recentlyCompleted.push(topicName);
        } else {
          if (nextUp.length < 2) nextUp.push(topicName);
        }
      }
    }
  }
  
  recentlyCompleted = recentlyCompleted.slice(-2); // Get last 2 completed

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Nova Mentor Greeting Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05] border border-indigo-500/10 rounded-3xl p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <UserCircle className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{greeting} 👋</h1>
              <p className="text-sm font-medium text-indigo-500">Nova - Your AI Mentor</p>
            </div>
          </div>

          {roadmap ? (
            <div className="space-y-6 max-w-2xl">
              <p className="text-lg text-foreground font-medium leading-relaxed">
                You're making solid progress on your journey to becoming a <span className="font-bold text-indigo-500">{profile?.targetRole}</span>. Keep up the momentum!
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {recentlyCompleted.length > 0 && (
                  <div className="bg-background/50 border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recently Completed</h3>
                    <ul className="space-y-2">
                      {recentlyCompleted.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-foreground">
                          <span className="text-emerald-500 mt-0.5">✓</span> {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {nextUp.length > 0 && (
                  <div className="bg-background/50 border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Up Next</h3>
                    <ul className="space-y-2">
                      {nextUp.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-medium text-foreground">
                          <div className="w-4 h-4 rounded-full border-2 border-indigo-500/50 mt-0.5 shrink-0" /> {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="max-w-2xl">
              <p className="text-lg text-foreground font-medium leading-relaxed">
                Let's get started on your career journey. I need to analyze your skills first to build a customized roadmap for you!
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 group"
        >
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
            <Target className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 text-card-foreground">Skill Match</h3>
            <p className="text-4xl font-extrabold mb-4 text-primary tracking-tight">{currentScore}%</p>
            <p className="text-sm text-muted-foreground font-medium">
              {currentMissingCount > 0 
                ? `You are missing ${currentMissingCount} core skills for this role.` 
                : currentScore === 100 ? "You have mastered all core skills! You are ready." : "Analyze your profile first."}
            </p>
          </div>
          <Link href="/dashboard/skills" className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 w-fit group/link">
            View Analysis <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="bg-gradient-to-br from-sky-500/10 to-blue-500/5 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-lg shadow-sky-500/10 hover:shadow-sky-500/30 group"
        >
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
            <Activity className="w-32 h-32 text-sky-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-1 text-card-foreground">Roadmap Progress</h3>
            <p className="text-4xl font-extrabold mb-4 text-sky-500 tracking-tight">{roadmap ? `Week ${safeIndex + 1}` : "0%"}</p>
            <div className="w-full bg-muted rounded-full h-2.5 mb-3 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progressPercent}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium truncate">Focus: {roadmap ? currentWeekTitle : "Not Started"}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 group"
        >
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
            <Trophy className="w-32 h-32 text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-card-foreground">Recommended Projects</h3>
              <p className="text-4xl font-extrabold mb-4 text-amber-500 tracking-tight">{projects.length || 0}</p>
              <p className="text-sm text-muted-foreground font-medium truncate">Build your portfolio.</p>
            </div>
            <Link href="/dashboard/projects" className="mt-auto inline-flex items-center text-sm font-semibold text-amber-500 hover:text-amber-600 w-fit group/link pt-6">
              View Projects <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-card to-primary/5 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 shadow-xl shadow-primary/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none">
             <Activity className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-6 text-foreground">Recommended Actions</h2>
          <div className="space-y-4">
            
            {!roadmap ? (
              profile && analysis ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors rounded-2xl border border-primary/10 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">Generate New Roadmap</p>
                      <p className="text-sm text-muted-foreground font-medium truncate">You updated your role. Generate a new custom roadmap.</p>
                    </div>
                  </div>
                  <Link href="/dashboard/skills" className="w-full sm:w-auto text-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 font-semibold">Generate</Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors rounded-2xl border border-primary/10 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">Setup Profile Page</p>
                      <p className="text-sm text-muted-foreground font-medium truncate">Check if your skills are enough to get that job.</p>
                    </div>
                  </div>
                  <Link href="/dashboard/profile" className="w-full sm:w-auto text-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 font-semibold">Setup Now</Link>
                </div>
              )
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors rounded-2xl border border-border gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-foreground shrink-0 shadow-sm">
                    <Clock className="w-6 h-6 text-sky-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{currentTopic}</p>
                    <p className="text-sm text-muted-foreground font-medium truncate">Current Week Study Topic</p>
                  </div>
                </div>
                <Link href="/dashboard/roadmap" className="w-full sm:w-auto text-center px-5 py-2.5 bg-background border border-border hover:bg-muted text-foreground rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 font-semibold">Start</Link>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors rounded-2xl border border-border gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-foreground shrink-0 shadow-sm">
                  <Target className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">Take Mock Interview</p>
                  <p className="text-sm text-muted-foreground font-medium truncate">Test your {profile?.targetRole || "knowledge"}</p>
                </div>
              </div>
              <Link href="/dashboard/interviews" className="w-full sm:w-auto text-center px-5 py-2.5 bg-background border border-border hover:bg-muted text-foreground rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 font-semibold">Begin</Link>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Skills Tree */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-card to-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-xl shadow-emerald-500/10 flex flex-col h-full max-h-[500px]"
        >
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Network className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Skills Mastery Tree</h2>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-6">
            {roadmap ? roadmap.weeks.map((week: any, w: number) => {
              const isWeekCompleted = w < currentWeekIndex;
              return (
                <div key={w} className="space-y-2">
                  <h3 className="font-bold text-foreground">{week.title}</h3>
                  <div className="ml-2 border-l-2 border-border/50 pl-4 space-y-2">
                    {week.topics.map((topic: string, t: number) => {
                      const isCompleted = isWeekCompleted || completedTopics[`${w}-${t}`];
                      return (
                        <div key={t} className="flex items-start gap-2 text-sm group">
                          <span className="text-muted-foreground/50 mt-0.5">├─</span>
                          <span className={`font-medium leading-tight ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{topic}</span>
                          <div className="ml-auto pl-2 mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }) : (
              <p className="text-muted-foreground font-medium">Analyze your profile to generate your skills tree.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
