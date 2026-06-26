"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, PlayCircle, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function InterviewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [interviewType, setInterviewType] = useState("Technical");
  
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    setIsStarted(true);
    setIsLoading(true);

    const initialMessage: Message = { 
      id: "start", 
      role: "user", 
      content: `Hello, I'm ready to begin my ${interviewType} interview for the ${profile?.targetRole || "Software Engineer"} position.` 
    };

    setMessages([initialMessage]);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("skillforge_api_key") ? { "x-api-key": localStorage.getItem("skillforge_api_key") as string } : {})
        },
        body: JSON.stringify({ 
          messages: [initialMessage],
          userProfile: profile,
          interviewType
        })
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";

      const aiMessageId = Date.now().toString();
      setMessages([{ id: initialMessage.id, role: initialMessage.role, content: initialMessage.content }, { id: aiMessageId, role: "assistant", content: "" }]);

      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }
        
        aiMessageContent += decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = aiMessageContent;
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      alert("Error starting interview.");
      setIsLoading(false);
      setIsStarted(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("skillforge_api_key") ? { "x-api-key": localStorage.getItem("skillforge_api_key") as string } : {})
        },
        body: JSON.stringify({ 
          messages: newMessages,
          userProfile: profile,
          interviewType
        })
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";

      const aiMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMessageId, role: "assistant", content: "" }]);
      
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (isFirstChunk) {
          setIsLoading(false);
          isFirstChunk = false;
        }
        
        aiMessageContent += decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = aiMessageContent;
          return newMsgs;
        });
      }

      // If stream ended without any content (usually due to rate limits or API errors)
      if (!aiMessageContent) {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = "⚠️ Sorry, I encountered an error. This is usually because of API rate limits. Please wait a moment and try again.";
          return newMsgs;
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      alert("Error getting response.");
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Profile Required</h2>
        <p className="text-muted-foreground mb-6 font-medium">You need to set up your profile first to start a personalized mock interview.</p>
        <button onClick={() => router.push("/dashboard/profile")} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors shadow-sm font-semibold">
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex justify-between items-end mb-6 shrink-0 mt-8 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Mock Interview</h1>
          <p className="text-muted-foreground font-medium">Practice your interview skills with an AI Hiring Manager.</p>
        </div>
        
        {isStarted && (
          <button onClick={() => { setIsStarted(false); setMessages([]); }} className="text-sm px-4 py-2 font-medium bg-muted hover:bg-destructive/10 text-foreground hover:text-destructive rounded-lg transition-colors shadow-sm border border-border">
            End Interview
          </button>
        )}
      </div>

      {!isStarted ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border shadow-sm rounded-3xl p-8 max-w-xl mx-auto mt-12 w-full text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-primary/20">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Ready for your interview?</h2>
          <p className="text-muted-foreground mb-8 font-medium">
            The AI will act as a hiring manager for the <span className="text-foreground font-semibold">{profile.targetRole}</span> position. 
            It will ask you questions, evaluate your answers, and provide real-time scores and feedback.
          </p>

          <div className="mb-8 text-left bg-background rounded-2xl p-5 border border-border shadow-inner">
            <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> Select Interview Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Technical', 'Behavioral', 'System Design', 'General'].map(type => (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${interviewType === type ? 'bg-primary text-primary-foreground shadow-md hover:-translate-y-0.5' : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={startInterview}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5"
          >
            <PlayCircle className="w-5 h-5" /> Start Interview
          </button>
        </motion.div>
      ) : (
        <div className="flex-1 overflow-hidden bg-card border border-border shadow-sm rounded-2xl flex flex-col mb-4 md:mb-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m) => {
              if (m.id === "start") return null; // Hide the initial hidden prompt
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id} 
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary' : 'bg-muted border border-border'}`}>
                    {m.role === 'user' ? <User className="w-5 h-5 text-primary-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>
                  <div className={`px-5 py-4 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted border border-border text-foreground rounded-tl-sm'}`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed prose dark:prose-invert prose-slate prose-p:my-1 prose-ul:my-1">{m.content}</div>
                  </div>
                </motion.div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-muted border border-border text-foreground rounded-tl-sm flex items-center shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="ml-3 text-sm text-muted-foreground font-medium">Evaluating...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                className="w-full bg-background border border-border rounded-full pl-6 pr-14 py-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 w-10 h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-full flex items-center justify-center text-primary-foreground transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
