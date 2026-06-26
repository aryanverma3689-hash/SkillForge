"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function MentorPage() {
  const [profile, setProfile] = useState<any>(null);
  const [contextData, setContextData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm Nova, your AI Career Coach. I've analyzed your profile. What would you like to know about your career path, interview preparation, or skill development?"
    }
  ]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    // Load all other context for Nova
    setContextData({
      analysis: localStorage.getItem("skillforge_analysis") ? JSON.parse(localStorage.getItem("skillforge_analysis")!) : null,
      roadmap: localStorage.getItem("skillforge_roadmap") ? JSON.parse(localStorage.getItem("skillforge_roadmap")!) : null,
      progress: localStorage.getItem("skillforge_progress") ? parseInt(localStorage.getItem("skillforge_progress")!) : 0,
      completedTopics: localStorage.getItem("skillforge_topic_progress") ? JSON.parse(localStorage.getItem("skillforge_topic_progress")!) : {},
      projects: localStorage.getItem("skillforge_projects") ? JSON.parse(localStorage.getItem("skillforge_projects")!) : [],
    });

    const savedChat = localStorage.getItem("skillforge_nova_chat");
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 1) {
      localStorage.setItem("skillforge_nova_chat", JSON.stringify(messages));
    }
  }, [messages]);

  const clearChat = () => {
    if (confirm("Are you sure you want to clear your chat history with Nova?")) {
      const defaultMessage: Message[] = [{
        id: "welcome",
        role: "assistant",
        content: "Hi there! I'm Nova, your AI Career Coach. I've analyzed your profile. What would you like to know about your career path, interview preparation, or skill development?"
      }];
      setMessages(defaultMessage);
      localStorage.setItem("skillforge_nova_chat", JSON.stringify(defaultMessage));
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(localStorage.getItem("skillforge_api_key") ? { "x-api-key": localStorage.getItem("skillforge_api_key") as string } : {})
        },
        body: JSON.stringify({ 
          messages: newMessages,
          userProfile: profile,
          contextData: contextData
        })
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";

      // Add empty assistant message that we will stream into
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
      alert("Error getting response. Make sure your API key is in .env");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 shrink-0 mt-8 md:mt-0">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Nova</h1>
          <p className="text-muted-foreground">Ask questions about your career path, resume, or get interview advice.</p>
        </div>
        {messages.length > 1 && (
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden bg-card border border-border shadow-sm rounded-2xl flex flex-col mb-16 md:mb-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id} 
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary' : 'bg-muted border border-border'}`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-primary-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm' : 'bg-muted border border-border text-foreground rounded-tl-sm shadow-sm'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-muted border border-border text-foreground rounded-tl-sm flex items-center shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
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
              placeholder="Ask me anything..."
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
    </div>
  );
}
