"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Printer, Plus, Trash2, Code2, Briefcase, Mail, Phone, LayoutDashboard } from "lucide-react";

type Education = { school: string; degree: string; year: string; gpa: string };
type Experience = { company: string; role: string; duration: string; description: string };
type Project = { name: string; tech: string; description: string; url: string };
type Certification = { name: string; issuer: string; year: string };

export default function ResumeBuilder() {
  const [profile, setProfile] = useState<any>(null);
  
  const [name, setName] = useState("Your Name");
  const [email, setEmail] = useState("email@example.com");
  const [phone, setPhone] = useState("+1 234 567 8900");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/username");
  const [github, setGithub] = useState("github.com/username");
  const [summary, setSummary] = useState("");
  
  const [education, setEducation] = useState<Education[]>([
    { school: "University Name", degree: "Bachelor of Science in Computer Science", year: "2020 - 2024", gpa: "9.2/10" }
  ]);
  
  const [experience, setExperience] = useState<Experience[]>([
    { company: "Tech Company Inc.", role: "Software Engineering Intern", duration: "Jun 2023 - Aug 2023", description: "• Developed scalable REST APIs using Node.js and Express.\n• Improved database query performance by 25%." }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { name: "Personal Portfolio", tech: "Next.js, Tailwind CSS", description: "• Built a fully responsive personal portfolio.\n• Implemented dark mode and dynamic routing.", url: "portfolio.com" }
  ]);

  const [certifications, setCertifications] = useState<Certification[]>([
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", year: "2023" }
  ]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("skillforge_profile");
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
      setSummary(`${p.experience} professional specializing in ${p.targetRole}. Highly skilled in ${p.skills.slice(0, 3).join(", ")} and eager to contribute to innovative teams.`);
    }
  }, []);

  const [template, setTemplate] = useState("modern");

  const addEducation = () => setEducation([...education, { school: "", degree: "", year: "", gpa: "" }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

  const addExperience = () => setExperience([...experience, { company: "", role: "", duration: "", description: "" }]);
  const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

  const addProject = () => setProjects([...projects, { name: "", tech: "", description: "", url: "" }]);
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index));

  const addCertification = () => setCertifications([...certifications, { name: "", issuer: "", year: "" }]);
  const removeCertification = (index: number) => setCertifications(certifications.filter((_, i) => i !== index));

  const handlePrint = () => {
    window.print();
  };

  // Template Styles
  const getTemplateStyles = () => {
    switch(template) {
      case "minimalist":
        return {
          container: "font-sans text-slate-800",
          header: "text-left mb-8 pb-6",
          name: "text-4xl font-light text-slate-900 mb-2 tracking-tight",
          contact: "flex flex-wrap gap-4 text-sm text-slate-500",
          sectionTitle: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4 mt-8",
          skillDot: "w-1 h-1 bg-slate-300 rounded-full",
          projectName: "font-medium text-slate-900 text-base",
          accentText: "text-slate-400"
        };
      case "professional":
        return {
          container: "font-serif text-slate-900",
          header: "text-center mb-8 border-b-2 border-slate-900 pb-6",
          name: "text-4xl font-bold uppercase tracking-wider text-slate-900 mb-3",
          contact: "flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-700",
          sectionTitle: "text-lg font-bold uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-4 mt-6",
          skillDot: "w-1.5 h-1.5 bg-slate-800 rotate-45",
          projectName: "font-bold text-slate-900 text-base",
          accentText: "text-slate-700 font-semibold"
        };
      case "executive":
        return {
          container: "font-serif text-slate-800",
          header: "text-center mb-10",
          name: "text-5xl font-normal text-slate-900 mb-4 tracking-tight",
          contact: "flex flex-wrap justify-center gap-6 text-sm text-slate-600",
          sectionTitle: "text-xl font-normal text-slate-900 border-b border-slate-300 pb-2 mb-5 mt-8",
          skillDot: "hidden",
          projectName: "font-semibold text-slate-900 text-lg",
          accentText: "text-slate-500 italic"
        };
      case "creative":
        return {
          container: "font-sans text-slate-700",
          header: "mb-10 border-l-4 border-teal-500 pl-6",
          name: "text-5xl font-black text-slate-900 mb-3 tracking-tighter",
          contact: "flex flex-wrap gap-4 text-sm font-medium text-teal-700",
          sectionTitle: "text-lg font-bold text-teal-700 mb-4 mt-8",
          skillDot: "w-2 h-2 bg-teal-400 rounded-sm",
          projectName: "font-bold text-slate-900 text-base",
          accentText: "text-teal-600 font-semibold"
        };
      case "modern":
      default:
        return {
          container: "font-sans text-slate-800",
          header: "flex justify-between items-end mb-8 bg-zinc-50 p-6 rounded-2xl border border-zinc-100",
          name: "text-4xl font-extrabold tracking-tight text-zinc-900 mb-2",
          contact: "flex flex-col gap-1 text-sm font-medium text-zinc-500 text-right",
          sectionTitle: "text-base font-bold text-zinc-900 flex items-center gap-2 mb-4 mt-8 before:w-6 before:h-0.5 before:bg-zinc-300",
          skillDot: "w-1.5 h-1.5 bg-zinc-400 rounded-full",
          projectName: "font-bold text-zinc-900 text-base",
          accentText: "text-zinc-500 font-medium"
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-2rem)] overflow-y-auto lg:overflow-hidden">
      {/* Editor Panel (Hidden when printing) */}
      <div className="w-full lg:w-1/2 lg:overflow-y-auto p-4 sm:p-8 bg-background border-b lg:border-b-0 lg:border-r border-border print:hidden pb-12 lg:pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground">Fill in your details to generate an ATS-friendly resume.</p>
        </div>

        <div className="space-y-8">
          {/* Personal Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-border text-foreground pb-2">Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1 font-medium">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1 font-medium">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1 font-medium">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1 font-medium">LinkedIn</label>
                <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1 font-medium">GitHub</label>
                <input value={github} onChange={e => setGithub(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1 font-medium">Professional Summary</label>
              <textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary shadow-sm" />
            </div>
          </section>

          {/* Education */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-xl font-semibold text-foreground">Education</h2>
              <button onClick={addEducation} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-lg space-y-3 relative group shadow-sm">
                <button onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                <input placeholder="School/University" value={edu.school} onChange={e => { const n = [...education]; n[idx].school = e.target.value; setEducation(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm font-medium text-foreground placeholder:text-muted-foreground" />
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="Degree (e.g. BS Computer Science)" value={edu.degree} onChange={e => { const n = [...education]; n[idx].degree = e.target.value; setEducation(n); }} className="col-span-2 w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
                  <input placeholder="Year (e.g. 2020-2024)" value={edu.year} onChange={e => { const n = [...education]; n[idx].year = e.target.value; setEducation(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
                <input placeholder="GPA / CGPA (e.g. 9.2/10)" value={edu.gpa || ""} onChange={e => { const n = [...education]; n[idx].gpa = e.target.value; setEducation(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            ))}
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-xl font-semibold text-foreground">Work Experience</h2>
              <button onClick={addExperience} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
            </div>
            {experience.map((exp, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-lg space-y-3 relative group shadow-sm">
                <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Company Name" value={exp.company} onChange={e => { const n = [...experience]; n[idx].company = e.target.value; setExperience(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm font-medium text-foreground placeholder:text-muted-foreground" />
                  <input placeholder="Duration (e.g. Jun 2023 - Present)" value={exp.duration} onChange={e => { const n = [...experience]; n[idx].duration = e.target.value; setExperience(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
                <input placeholder="Job Title / Role" value={exp.role} onChange={e => { const n = [...experience]; n[idx].role = e.target.value; setExperience(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
                <textarea rows={3} placeholder="Description (Use bullet points: • Achieved X by doing Y)" value={exp.description} onChange={e => { const n = [...experience]; n[idx].description = e.target.value; setExperience(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm resize-none text-foreground placeholder:text-muted-foreground" />
              </div>
            ))}
          </section>

          {/* Projects */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-xl font-semibold text-foreground">Projects</h2>
              <button onClick={addProject} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
            </div>
            {projects.map((proj, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-lg space-y-3 relative group shadow-sm">
                <button onClick={() => removeProject(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Project Name" value={proj.name} onChange={e => { const n = [...projects]; n[idx].name = e.target.value; setProjects(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm font-medium text-foreground placeholder:text-muted-foreground" />
                  <input placeholder="Project URL" value={proj.url} onChange={e => { const n = [...projects]; n[idx].url = e.target.value; setProjects(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-primary placeholder:text-muted-foreground" />
                </div>
                <input placeholder="Tech Stack (e.g. React, Node.js, MongoDB)" value={proj.tech} onChange={e => { const n = [...projects]; n[idx].tech = e.target.value; setProjects(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
                <textarea rows={3} placeholder="Description (Use bullet points: • Built X using Y)" value={proj.description} onChange={e => { const n = [...projects]; n[idx].description = e.target.value; setProjects(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm resize-none text-foreground placeholder:text-muted-foreground" />
              </div>
            ))}
          </section>

          {/* Certifications */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h2 className="text-xl font-semibold text-foreground">Certifications</h2>
              <button onClick={addCertification} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"><Plus className="w-4 h-4"/> Add</button>
            </div>
            {certifications.map((cert, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-lg space-y-3 relative group shadow-sm">
                <button onClick={() => removeCertification(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="Certification Name" value={cert.name} onChange={e => { const n = [...certifications]; n[idx].name = e.target.value; setCertifications(n); }} className="col-span-2 w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm font-medium text-foreground placeholder:text-muted-foreground" />
                  <input placeholder="Year" value={cert.year} onChange={e => { const n = [...certifications]; n[idx].year = e.target.value; setCertifications(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
                </div>
                <input placeholder="Issuing Organization (e.g. AWS, Google)" value={cert.issuer} onChange={e => { const n = [...certifications]; n[idx].issuer = e.target.value; setCertifications(n); }} className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none pb-1 text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-1/2 bg-muted lg:overflow-y-auto flex flex-col items-center p-4 sm:p-8 print:w-full print:p-0 print:bg-white print:overflow-visible">
        
        <div className="w-full flex justify-between items-center mb-6 print:hidden">
          <div className="flex bg-background rounded-lg p-1 border border-border shadow-sm flex-wrap gap-1">
            <button onClick={() => setTemplate("modern")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${template === "modern" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Modern</button>
            <button onClick={() => setTemplate("minimalist")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${template === "minimalist" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Minimalist</button>
            <button onClick={() => setTemplate("professional")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${template === "professional" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Professional</button>
            <button onClick={() => setTemplate("executive")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${template === "executive" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Executive</button>
            <button onClick={() => setTemplate("creative")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${template === "creative" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Creative</button>
          </div>
          
          <button onClick={handlePrint} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md">
            <Printer className="w-4 h-4" /> Download PDF
          </button>
        </div>

        {/* The Resume Page (A4 Aspect Ratio) */}
        <div className={`print:visible w-full max-w-[850px] aspect-[1/1.414] bg-white p-12 shadow-2xl print:shadow-none print:w-full print:max-w-none print:aspect-auto print:p-12 print:m-0 mx-auto ${styles.container}`}>
          
          {/* Header */}
          <header className={styles.header}>
            <div>
              <h1 className={styles.name}>{name || "Your Name"}</h1>
              {template !== "modern" && <div className={styles.contact}>
                {email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {email}</span>}
                {phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {phone}</span>}
                {linkedin && <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {linkedin}</span>}
                {github && <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> {github}</span>}
              </div>}
            </div>
            
            {template === "modern" && (
              <div className={styles.contact}>
                {email && <span>{email}</span>}
                {phone && <span>{phone}</span>}
                {linkedin && <span>{linkedin}</span>}
                {github && <span>{github}</span>}
              </div>
            )}
          </header>

          <div className="space-y-6">
            {/* Summary */}
            {summary && (
              <section>
                <h2 className={styles.sectionTitle}>Professional Summary</h2>
                <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
              </section>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Core Competencies</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
                  {profile.skills.map((skill: string, i: number) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className={styles.skillDot}></span> {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Work Experience</h2>
                <div className="space-y-5">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={styles.projectName}>{exp.role}</h3>
                        <span className={`text-sm ${styles.accentText} whitespace-nowrap ml-4`}>{exp.duration}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-800 mb-1.5">{exp.company}</div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Projects</h2>
                <div className="space-y-5">
                  {projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={styles.projectName}>{proj.name}</h3>
                          {proj.url && <span className="text-xs text-blue-500 font-medium">({proj.url})</span>}
                        </div>
                      </div>
                      {proj.tech && <div className={`text-xs ${styles.accentText} mb-1.5`}>Technologies: {proj.tech}</div>}
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Education</h2>
                <div className="space-y-3">
                  {education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <h3 className={styles.projectName}>{edu.school}</h3>
                        <p className="text-sm text-slate-700">{edu.degree} {edu.gpa && <span className="text-slate-500 font-medium text-xs ml-2">CGPA: {edu.gpa}</span>}</p>
                      </div>
                      <span className={`text-sm ${styles.accentText} whitespace-nowrap ml-4`}>{edu.year}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Certifications</h2>
                <div className="space-y-2">
                  {certifications.map((cert, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{cert.name}</span>
                        <span className="text-sm text-slate-600 ml-2">— {cert.issuer}</span>
                      </div>
                      <span className={`text-sm ${styles.accentText} whitespace-nowrap ml-4`}>{cert.year}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @page {
          margin: 0; /* Removes browser headers and footers */
          size: auto;
        }
        @media print {
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
          body > * {
            visibility: hidden;
          }
          .print\\:visible, .print\\:visible * {
            visibility: visible;
          }
          .print\\:visible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
        }
      `}} />
    </div>
  );
}
