import React, { useState } from "react"
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FolderKanban,
  Play,
  Mail,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { Link } from "react-router-dom"
import { usePortfolio } from "../../context/PortfolioContext"
import type { HeroData, AchievementItem, ContactData, FooterData } from "../../context/PortfolioContext"
import type { ProjectItem } from "../../data/projects"
import type { ExperienceItem } from "../../data/experience"
import type { EducationItem } from "../../data/education"
import type { Skill } from "../../data/skills"
import type { VideoItem } from "../../data/videos"
import { GraduationCap as SchoolIcon } from "lucide-react"

type SettingsTab = "hero" | "education" | "experience" | "skills" | "projects" | "multimedia" | "contact_footer"

export default function ResumeSettings() {
  const portfolio = usePortfolio()
  const [activeTab, setActiveTab] = useState<SettingsTab>("hero")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Local form states
  const [heroForm, setHeroForm] = useState<HeroData>(portfolio.hero)
  const [educationForm, setEducationForm] = useState<EducationItem[]>(portfolio.education)
  const [achievementsForm, setAchievementsForm] = useState<AchievementItem[]>(portfolio.achievements)
  const [experienceForm, setExperienceForm] = useState<ExperienceItem[]>(portfolio.experiences)
  const [skillsForm, setSkillsForm] = useState<Skill[]>(portfolio.skills)
  const [projectsForm, setProjectsForm] = useState<ProjectItem[]>(portfolio.projects)
  const [videosForm, setVideosForm] = useState<VideoItem[]>(portfolio.videos)
  const [contactForm, setContactForm] = useState<ContactData>(portfolio.contact)
  const [footerForm, setFooterForm] = useState<FooterData>(portfolio.footer)

  // Keep forms updated if portfolio context reloads
  React.useEffect(() => {
    setHeroForm(portfolio.hero)
    setEducationForm(portfolio.education)
    setAchievementsForm(portfolio.achievements)
    setExperienceForm(portfolio.experiences)
    setSkillsForm(portfolio.skills)
    setProjectsForm(portfolio.projects)
    setVideosForm(portfolio.videos)
    setContactForm(portfolio.contact)
    setFooterForm(portfolio.footer)
  }, [portfolio.isLoading])

  const handleSaveAll = async () => {
    try {
      setIsSaving(true)
      await portfolio.updateHero(heroForm)
      await portfolio.updateEducation(educationForm)
      await portfolio.updateAchievements(achievementsForm)
      await portfolio.updateExperiences(experienceForm)
      await portfolio.updateSkills(skillsForm)
      await portfolio.updateProjects(projectsForm)
      await portfolio.updateVideos(videosForm)
      await portfolio.updateContact(contactForm)
      await portfolio.updateFooter(footerForm)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert("Failed to save changes: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to="/" className="p-2 rounded-xl bg-background border hover:bg-muted text-muted-foreground transition-all">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                Resume <span className="text-primary">Settings CMS</span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-medium pl-10">
              Edit all sections of haroldselga.vercel.app with real-time Supabase synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={portfolio.seedDataToSupabase}
              disabled={portfolio.isSeeding || isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{portfolio.isSeeding ? "Seeding Data..." : "Seed Data to Supabase"}</span>
            </button>

            <button
              onClick={portfolio.resetToDefaults}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground border border-border/50 text-xs font-bold transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving All..." : saveSuccess ? "✅ All Saved!" : "Save All Changes"}</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl p-2 overflow-x-auto scrollbar-none">
          {[
            { id: "hero", label: "Hero & Profile", icon: User },
            { id: "education", label: "Education & Achievements", icon: GraduationCap },
            { id: "experience", label: "Work Experience", icon: Briefcase },
            { id: "skills", label: "Technical Arsenal", icon: Code2 },
            { id: "projects", label: "Featured Projects", icon: FolderKanban },
            { id: "multimedia", label: "Multimedia & Gallery", icon: Play },
            { id: "contact_footer", label: "Contact & Footer", icon: Mail },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* CMS Editor Body */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl">
          
          {/* TAB 1: HERO & PROFILE */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black uppercase text-foreground border-b border-border/40 pb-3">Hero & Profile Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                  <input
                    type="text"
                    value={heroForm.name}
                    onChange={e => setHeroForm({ ...heroForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Role Title</label>
                  <input
                    type="text"
                    value={heroForm.title}
                    onChange={e => setHeroForm({ ...heroForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Subtitle</label>
                  <input
                    type="text"
                    value={heroForm.subtitle}
                    onChange={e => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Bio / Headline</label>
                  <textarea
                    rows={3}
                    value={heroForm.bio}
                    onChange={e => setHeroForm({ ...heroForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Profile Picture URL</label>
                  <input
                    type="text"
                    value={heroForm.profileImage}
                    onChange={e => setHeroForm({ ...heroForm, profileImage: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs font-mono text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Resume PDF URL</label>
                  <input
                    type="text"
                    value={heroForm.resumeUrl}
                    onChange={e => setHeroForm({ ...heroForm, resumeUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs font-mono text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">GitHub Link</label>
                  <input
                    type="url"
                    value={heroForm.githubUrl}
                    onChange={e => setHeroForm({ ...heroForm, githubUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs font-mono text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">LinkedIn Link</label>
                  <input
                    type="url"
                    value={heroForm.linkedinUrl}
                    onChange={e => setHeroForm({ ...heroForm, linkedinUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-xs font-mono text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION & ACHIEVEMENTS */}
          {activeTab === "education" && (
            <div className="space-y-8">
              {/* Education List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h2 className="text-lg font-black uppercase text-foreground">Educational Background</h2>
                  <button
                    onClick={() => setEducationForm([...educationForm, { degree: "Degree Name", school: "School Name", location: "Cabanatuan City", query: "", period: "2024 - 2025", level: "College", icon: SchoolIcon }])}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add School
                  </button>
                </div>
                {educationForm.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-primary">School #{idx + 1}</span>
                      <button
                        onClick={() => setEducationForm(educationForm.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => {
                          const copy = [...educationForm]
                          copy[idx].degree = e.target.value
                          setEducationForm(copy)
                        }}
                        placeholder="Degree / Program"
                        className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={edu.school}
                        onChange={e => {
                          const copy = [...educationForm]
                          copy[idx].school = e.target.value
                          setEducationForm(copy)
                        }}
                        placeholder="School Name"
                        className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={edu.period}
                        onChange={e => {
                          const copy = [...educationForm]
                          copy[idx].period = e.target.value
                          setEducationForm(copy)
                        }}
                        placeholder="Period (e.g. 2018 - 2022)"
                        className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Achievements & Certificates */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h2 className="text-lg font-black uppercase text-foreground">Achievements & Certificates</h2>
                  <button
                    onClick={() => setAchievementsForm([...achievementsForm, { id: String(Date.now()), title: "New Certificate / Honor", issuer: "TESDA / CSC", date: "2025", type: "Certificate" }])}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Achievement
                  </button>
                </div>
                {achievementsForm.map((ach, idx) => (
                  <div key={ach.id} className="p-3 bg-muted/20 border border-border/40 rounded-2xl flex flex-col md:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={ach.title}
                      onChange={e => {
                        const copy = [...achievementsForm]
                        copy[idx].title = e.target.value
                        setAchievementsForm(copy)
                      }}
                      placeholder="Title"
                      className="flex-1 px-3 py-2 bg-background border rounded-xl text-xs font-bold w-full"
                    />
                    <input
                      type="text"
                      value={ach.issuer}
                      onChange={e => {
                        const copy = [...achievementsForm]
                        copy[idx].issuer = e.target.value
                        setAchievementsForm(copy)
                      }}
                      placeholder="Issuer"
                      className="w-full md:w-36 px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={ach.date}
                      onChange={e => {
                        const copy = [...achievementsForm]
                        copy[idx].date = e.target.value
                        setAchievementsForm(copy)
                      }}
                      placeholder="Date"
                      className="w-full md:w-28 px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <button
                      onClick={() => setAchievementsForm(achievementsForm.filter((_, i) => i !== idx))}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="text-lg font-black uppercase text-foreground">Professional Work Experience</h2>
                <button
                  onClick={() => setExperienceForm([{ role: "Web Developer", company: "Company Name", location: "Location", locationUrl: "", duration: "2026 - PRESENT", tag: "WORK EXPERIENCE", description: ["Key responsibility..."] }, ...experienceForm])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </button>
              </div>

              {experienceForm.map((exp, idx) => (
                <div key={idx} className="p-5 bg-muted/20 border border-border/40 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-primary">Role #{idx + 1}: {exp.company}</span>
                    <button
                      onClick={() => setExperienceForm(experienceForm.filter((_, i) => i !== idx))}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={e => {
                        const copy = [...experienceForm]
                        copy[idx].role = e.target.value
                        setExperienceForm(copy)
                      }}
                      placeholder="Role Title"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={e => {
                        const copy = [...experienceForm]
                        copy[idx].company = e.target.value
                        setExperienceForm(copy)
                      }}
                      placeholder="Company Name"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={e => {
                        const copy = [...experienceForm]
                        copy[idx].duration = e.target.value
                        setExperienceForm(copy)
                      }}
                      placeholder="Duration"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={exp.location}
                      onChange={e => {
                        const copy = [...experienceForm]
                        copy[idx].location = e.target.value
                        setExperienceForm(copy)
                      }}
                      placeholder="Location"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Key Responsibilities (One per line)</label>
                    <textarea
                      rows={4}
                      value={exp.description.join("\n")}
                      onChange={e => {
                        const copy = [...experienceForm]
                        copy[idx].description = e.target.value.split("\n")
                        setExperienceForm(copy)
                      }}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-xs font-medium text-foreground"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: TECHNICAL ARSENAL (SKILLS) */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="text-lg font-black uppercase text-foreground">Technical Arsenal (Skills)</h2>
                <button
                  onClick={() => setSkillsForm([...skillsForm, { name: "New Skill", icon: "https://skillicons.dev/icons?i=js", category: "Languages", subCategory: "Primary" }])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Skill Badge
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skillsForm.map((s, idx) => (
                  <div key={idx} className="p-3 bg-muted/20 border border-border/40 rounded-2xl flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={s.name}
                      onChange={e => {
                        const copy = [...skillsForm]
                        copy[idx].name = e.target.value
                        setSkillsForm(copy)
                      }}
                      placeholder="Skill Name"
                      className="px-3 py-1.5 bg-background border rounded-xl text-xs font-bold w-1/3"
                    />
                    <input
                      type="text"
                      value={s.category}
                      onChange={e => {
                        const copy = [...skillsForm]
                        copy[idx].category = e.target.value
                        setSkillsForm(copy)
                      }}
                      placeholder="Category"
                      className="px-3 py-1.5 bg-background border rounded-xl text-xs font-bold w-1/3"
                    />
                    <button
                      onClick={() => setSkillsForm(skillsForm.filter((_, i) => i !== idx))}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FEATURED PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="text-lg font-black uppercase text-foreground">Featured Projects</h2>
                <button
                  onClick={() => setProjectsForm([{ title: "New Project", description: "Description...", image: "/projects/default.png", tags: ["React", "Node"], liveUrl: "#", githubUrl: "#", accent: "from-primary to-emerald-400" }, ...projectsForm])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </button>
              </div>

              {projectsForm.map((proj, idx) => (
                <div key={idx} className="p-5 bg-muted/20 border border-border/40 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-primary">Project #{idx + 1}: {proj.title}</span>
                    <button
                      onClick={() => setProjectsForm(projectsForm.filter((_, i) => i !== idx))}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={e => {
                        const copy = [...projectsForm]
                        copy[idx].title = e.target.value
                        setProjectsForm(copy)
                      }}
                      placeholder="Project Title"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={proj.image}
                      onChange={e => {
                        const copy = [...projectsForm]
                        copy[idx].image = e.target.value
                        setProjectsForm(copy)
                      }}
                      placeholder="Banner Image URL"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-mono"
                    />
                    <input
                      type="url"
                      value={proj.liveUrl}
                      onChange={e => {
                        const copy = [...projectsForm]
                        copy[idx].liveUrl = e.target.value
                        setProjectsForm(copy)
                      }}
                      placeholder="Live Demo URL"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-mono"
                    />
                    <input
                      type="url"
                      value={proj.githubUrl}
                      onChange={e => {
                        const copy = [...projectsForm]
                        copy[idx].githubUrl = e.target.value
                        setProjectsForm(copy)
                      }}
                      placeholder="GitHub Repository URL"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Description</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={e => {
                        const copy = [...projectsForm]
                        copy[idx].description = e.target.value
                        setProjectsForm(copy)
                      }}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tech Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={proj.tags.join(", ")}
                      onChange={e => {
                        const copy = [...projectsForm]
                        copy[idx].tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                        setProjectsForm(copy)
                      }}
                      className="w-full px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: MULTIMEDIA & GALLERY */}
          {activeTab === "multimedia" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="text-lg font-black uppercase text-foreground">Multimedia & Video Demos</h2>
                <button
                  onClick={() => setVideosForm([...videosForm, { title: "New Video Demo", id: "dQw4w9WgXcQ", category: "HOBBIES", description: "Demo video description" }])}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Video
                </button>
              </div>

              {videosForm.map((vid, idx) => (
                <div key={idx} className="p-4 bg-muted/20 border border-border/40 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-primary">Video #{idx + 1}: {vid.title}</span>
                    <button
                      onClick={() => setVideosForm(videosForm.filter((_, i) => i !== idx))}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={vid.title}
                      onChange={e => {
                        const copy = [...videosForm]
                        copy[idx].title = e.target.value
                        setVideosForm(copy)
                      }}
                      placeholder="Video Title"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={vid.id}
                      onChange={e => {
                        const copy = [...videosForm]
                        copy[idx].id = e.target.value
                        setVideosForm(copy)
                      }}
                      placeholder="YouTube Video ID (e.g. vQVZKAIgeUQ)"
                      className="px-3 py-2 bg-background border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: CONTACT & FOOTER */}
          {activeTab === "contact_footer" && (
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-black uppercase text-foreground border-b border-border/40 pb-3">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <h2 className="text-lg font-black uppercase text-foreground border-b border-border/40 pb-3">Footer Customization</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Footer Headline</label>
                    <input
                      type="text"
                      value={footerForm.headline}
                      onChange={e => setFooterForm({ ...footerForm, headline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Footer Sub-headline</label>
                    <textarea
                      rows={2}
                      value={footerForm.subheadline}
                      onChange={e => setFooterForm({ ...footerForm, subheadline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-medium text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Copyright Line</label>
                    <input
                      type="text"
                      value={footerForm.copyrightText}
                      onChange={e => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl text-sm font-bold text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="pt-6 border-t border-border/40 flex items-center justify-between">
            <Link to="/" className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> View Main Site
            </Link>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving All..." : saveSuccess ? "✅ Changes Saved!" : "Save All Changes"}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
