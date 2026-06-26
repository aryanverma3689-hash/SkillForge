"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, PlaySquare, MonitorPlay, FileCode2, Book, ExternalLink, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResourcesPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [weekResources, setWeekResources] = useState<Record<number, any[]>>({});
  const [isGeneratingResources, setIsGeneratingResources] = useState<number | null>(null);
  const [weekFilter, setWeekFilter] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setWeekFilter(params.get("week"));

    const savedRoadmap = localStorage.getItem("skillforge_roadmap");
    const savedResources = localStorage.getItem("skillforge_resources");
    
    if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
    if (savedResources) {
      const parsed = JSON.parse(savedResources);
      if (!Array.isArray(parsed)) {
        setWeekResources(parsed);
      }
    }
  }, []);

  const generateResources = async (weekIndex: number) => {
    const currentWeekTopics = roadmap.weeks?.[weekIndex]?.topics || [];
    
    try {
      setIsGeneratingResources(weekIndex);
      const response = await fetch("/api/recommend-resources", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("skillforge_api_key") ? { "x-api-key": localStorage.getItem("skillforge_api_key") as string } : {})
        },
        body: JSON.stringify({ topics: currentWeekTopics })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to generate resources");
      }

      const data = await response.json();
      
      const newWeekResources = { ...weekResources, [weekIndex]: data.resources };
      setWeekResources(newWeekResources);
      localStorage.setItem("skillforge_resources", JSON.stringify(newWeekResources));
      
    } catch (error: any) {
      console.error(error);
      alert(`Error generating resources: ${error.message || "Please check your API key"}`);
    } finally {
      setIsGeneratingResources(null);
    }
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case "YouTube": return <PlaySquare className="w-4 h-4 text-red-500" />;
      case "Course": return <MonitorPlay className="w-4 h-4 text-blue-400" />;
      case "Documentation": return <FileCode2 className="w-4 h-4 text-emerald-400" />;
      case "Book": return <Book className="w-4 h-4 text-yellow-400" />;
      default: return <BookOpen className="w-4 h-4 text-primary" />;
    }
  };

  if (!roadmap) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground">No Roadmap Found</h2>
        <p className="text-muted-foreground mb-6 font-medium">You need to analyze your skills first to generate a personalized roadmap and resources.</p>
        <button onClick={() => router.push("/dashboard/skills")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors shadow-sm font-semibold">
          Go to Skill Gap
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="mb-8">
        {weekFilter !== null && (
          <button 
            onClick={() => { setWeekFilter(null); router.push('/dashboard/resources'); }} 
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            &larr; Back to all weeks
          </button>
        )}
        <h1 className="text-3xl font-bold mb-2 text-foreground">Week-wise Resources</h1>
        <p className="text-muted-foreground font-medium">Curated study materials for each week of your roadmap.</p>
      </div>

      <div className="space-y-8">
        {roadmap.weeks?.map((week: any, index: number) => {
          if (weekFilter !== null && index.toString() !== weekFilter) return null;

          const currentResources = weekResources[index] || [];
          const isGenerating = isGeneratingResources === index;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="bg-card border border-border shadow-sm rounded-3xl p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{week.title}</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Topics: {week.topics.join(", ")}
                  </p>
                </div>
                
                <button 
                  onClick={() => generateResources(index)}
                  disabled={isGenerating}
                  className="shrink-0 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-sm"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  {currentResources.length > 0 ? "Regenerate" : "Generate Resources"}
                </button>
              </div>

              {isGenerating && currentResources.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="font-medium text-muted-foreground">Finding the best study materials...</p>
                </div>
              ) : currentResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentResources.map((res: any, i: number) => (
                    <a 
                      key={i}
                      href={res.provider.toLowerCase() === 'youtube' ? `https://www.youtube.com/results?search_query=${encodeURIComponent(res.title + ' tutorial')}` : res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col bg-background hover:bg-muted border border-border hover:border-primary/50 rounded-2xl p-5 transition-colors shadow-sm group h-full"
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className="mt-0.5 bg-muted p-2.5 rounded-xl border border-border">
                          {getResourceIcon(res.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{res.title}</h4>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      
                      <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span className={`px-2 py-1 rounded-md ${res.cost === 'Free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {res.cost}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-muted border border-border text-foreground">{res.provider}</span>
                        <span className="px-2 py-1 rounded-md bg-muted border border-border text-foreground">{res.difficulty}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center">
                  <AlertCircle className="w-10 h-10 text-muted-foreground opacity-50 mb-3" />
                  <p className="font-medium text-muted-foreground">No resources generated for this week yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Click the button above to find study materials.</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
