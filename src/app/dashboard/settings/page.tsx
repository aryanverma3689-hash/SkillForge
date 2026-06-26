"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Key, Shield, CheckCircle2, AlertTriangle, Save } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("skillforge_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    if (apiKey.trim() === "") {
      localStorage.removeItem("skillforge_api_key");
    } else {
      localStorage.setItem("skillforge_api_key", apiKey.trim());
    }
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your application preferences and API keys.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* API Key Section */}
        <section className="bg-card border border-border shadow-sm rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Custom API Key (BYOK)</h2>
              <p className="text-sm text-muted-foreground font-medium">Bring your own Google Gemini API key to bypass rate limits.</p>
            </div>
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-5 mb-8 flex gap-3 text-sm text-sky-700 dark:text-sky-300 shadow-sm">
            <Shield className="w-5 h-5 shrink-0 text-sky-500 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Your API key is stored <strong className="font-bold">locally in your browser</strong> and is never saved to any database. It is only sent directly to our server when making requests to Google's AI models. 
              Leave this blank to use the default platform key.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-foreground">Google Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="AIzaSy..." 
              className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm shadow-sm transition-all"
            />
            
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted-foreground font-medium">
                Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Google AI Studio</a>.
              </p>
              
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isSaved ? "Saved!" : "Save Key"}
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground font-medium">Clear all local data and start fresh.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
            <p className="text-sm text-muted-foreground max-w-sm font-medium">
              This will permanently delete your profile, roadmap, resources, and API key from this browser.
            </p>
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                  localStorage.clear();
                  window.location.href = "/";
                }
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              Clear All Data
            </button>
          </div>
        </section>

      </motion.div>
    </div>
  );
}
