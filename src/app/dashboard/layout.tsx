"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrainCircuit, LayoutDashboard, UserCircle, Target, FileText, Settings, Map, Briefcase, MessageSquare, Moon, Sun, ChevronRight, BookOpen, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Redirect to onboarding if no profile is set up
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (!savedProfile) {
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Ambient Dashboard Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <span className="font-bold">SkillForge</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 border-r border-border bg-card/95 backdrop-blur-xl flex-col fixed md:relative h-full z-50 md:z-20 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex print:hidden`}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">SkillForge</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group overflow-hidden"
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Active indicator dot */}
                {isActive && (
                   <motion.div 
                    layoutId="activeDot"
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`relative z-10 flex items-center gap-3 w-full ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground font-medium'}`}>
                  <item.icon className={`w-5 h-5 transition-all ${item.color} ${isActive ? 'scale-110 drop-shadow-md' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} />
                  <span className="flex-grow">{item.label}</span>
                  {!isActive && <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto space-y-4 bg-background/50 backdrop-blur-md">
          <Link 
            href="/dashboard/mentor"
            className="group flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary/10 to-indigo-500/10 hover:from-primary/20 hover:to-indigo-500/20 border border-primary/20 hover:border-primary/40 rounded-xl text-sm font-semibold text-primary transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" /> Ask Nova
          </Link>
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shadow-inner">
                <span className="text-sm font-bold text-foreground">AR</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Aryan</p>
                <p className="text-xs text-muted-foreground font-medium">Student</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative z-10 pt-16 md:pt-0 pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        {/* Floating Nova Button (Mobile friendly) */}
        <Link 
          href="/dashboard/mentor"
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xl shadow-primary/30 flex items-center justify-center transition-transform hover:scale-110 z-30 md:hidden"
        >
          <MessageSquare className="w-6 h-6" />
        </Link>
      </main>
    </div>
  );
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, color: "text-emerald-500" },
  { label: "Skill Gap", href: "/dashboard/skills", icon: Target, color: "text-rose-500" },
  { label: "Roadmap", href: "/dashboard/roadmap", icon: Map, color: "text-amber-500" },
  { label: "Learning Resources", href: "/dashboard/resources", icon: BookOpen, color: "text-teal-500" },
  { label: "Projects", href: "/dashboard/projects", icon: Briefcase, color: "text-indigo-500" },
  { label: "Job Match", href: "/dashboard/ats", icon: Target, color: "text-cyan-500" },
  { label: "Resume Builder", href: "/dashboard/resume", icon: FileText, color: "text-purple-500" },
  { label: "Mock Interviews", href: "/dashboard/interviews", icon: MessageSquare, color: "text-pink-500" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-slate-500" },
];
