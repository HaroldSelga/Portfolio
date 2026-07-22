import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"

// Data defaults
import { projects as defaultProjects, type ProjectItem } from "../data/projects"
import { experiences as defaultExperiences, type ExperienceItem } from "../data/experience"
import { educationData as defaultEducation, type EducationItem } from "../data/education"
import { allSkills as defaultSkills, type Skill } from "../data/skills"
import { videoData as defaultVideos, type VideoItem } from "../data/videos"

export interface HeroData {
  name: string
  title: string
  subtitle: string
  location: string
  bio: string
  availabilityBadge: string
  profileImage: string
  resumeUrl: string
  githubUrl: string
  linkedinUrl: string
  facebookUrl: string
  email: string
  locationMapUrl: string
}

export interface AchievementItem {
  id: string
  title: string
  issuer: string
  date: string
  type: string
  credentialId?: string
  link?: string
}

export interface ContactData {
  email: string
  phone: string
  location: string
  formActionUrl?: string
}

export interface FooterData {
  headline: string
  subheadline: string
  copyrightText: string
  githubUrl: string
  linkedinUrl: string
  facebookUrl: string
  email: string
}

export const initialHeroData: HeroData = {
  name: "John Harold Eugenio Selga",
  title: "Software Engineer / Web Developer",
  subtitle: "Full-Stack Web Developer & ERP Systems Architect",
  location: "Cabanatuan City, Nueva Ecija, Philippines",
  bio: "Architecting enterprise systems, web portals, and scalable cloud solutions with modern technologies like Laravel 12, React 19, TypeScript, PostgreSQL, and Inertia.js.",
  availabilityBadge: "AVAILABLE FOR OPPORTUNITIES",
  profileImage: "/images/profile.jpg",
  resumeUrl: "/documents/requirements/need to print/resume final harold (1).pdf",
  githubUrl: "https://github.com/HaroldSelga",
  linkedinUrl: "https://www.linkedin.com/in/harold-selga/",
  facebookUrl: "https://facebook.com/johnselga18",
  email: "johnselga18@gmail.com",
  locationMapUrl: "https://maps.google.com/?q=Cabanatuan+City+Nueva+Ecija"
}

export const initialAchievementsData: AchievementItem[] = [
  { id: "1", title: "National Certificate II: Computer System Services", issuer: "TESDA", date: "June 2021", type: "Certificate", credentialId: "210349022116611" },
  { id: "2", title: "National Certificate III: Events Management Services", issuer: "TESDA", date: "October 2022", type: "Certificate", credentialId: "22034039109" },
  { id: "3", title: "Certificate of Employment - IT Supervisor Jr.", issuer: "TRB Express Inc.", date: "June 2025", type: "Employment" },
  { id: "4", title: "Civil Service Eligible (Professional)", issuer: "CSC Philippines", date: "2024", type: "Eligibility" },
]

export const initialContactData: ContactData = {
  email: "johnselga18@gmail.com",
  phone: "+63 936 332 4878",
  location: "Cabanatuan City, Nueva Ecija, Philippines",
}

export const initialFooterData: FooterData = {
  headline: "Let's Build Something Exceptional Together",
  subheadline: "Available for full-stack engineering roles, enterprise system development, and freelance web projects.",
  copyrightText: `© ${new Date().getFullYear()} John Harold Selga. All rights reserved.`,
  githubUrl: "https://github.com/HaroldSelga",
  linkedinUrl: "https://www.linkedin.com/in/harold-selga/",
  facebookUrl: "https://facebook.com/johnselga18",
  email: "johnselga18@gmail.com",
}

interface PortfolioContextType {
  hero: HeroData
  education: EducationItem[]
  achievements: AchievementItem[]
  experiences: ExperienceItem[]
  skills: Skill[]
  projects: ProjectItem[]
  videos: VideoItem[]
  contact: ContactData
  footer: FooterData
  isLoading: boolean
  isSeeding: boolean
  
  updateHero: (data: HeroData) => Promise<void>
  updateEducation: (data: EducationItem[]) => Promise<void>
  updateAchievements: (data: AchievementItem[]) => Promise<void>
  updateExperiences: (data: ExperienceItem[]) => Promise<void>
  updateSkills: (data: Skill[]) => Promise<void>
  updateProjects: (data: ProjectItem[]) => Promise<void>
  updateVideos: (data: VideoItem[]) => Promise<void>
  updateContact: (data: ContactData) => Promise<void>
  updateFooter: (data: FooterData) => Promise<void>
  
  seedDataToSupabase: () => Promise<void>
  resetToDefaults: () => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hero, setHero] = useState<HeroData>(initialHeroData)
  const [education, setEducation] = useState<EducationItem[]>(defaultEducation)
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievementsData)
  const [experiences, setExperiences] = useState<ExperienceItem[]>(defaultExperiences)
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)
  const [projects, setProjects] = useState<ProjectItem[]>(defaultProjects)
  const [videos, setVideos] = useState<VideoItem[]>(defaultVideos)
  const [contact, setContact] = useState<ContactData>(initialContactData)
  const [footer, setFooter] = useState<FooterData>(initialFooterData)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)

  // Fetch initial content from Supabase, fallback to localStorage
  const fetchAllContent = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("portfolio_content").select("*")

      if (error) throw error

      if (data && data.length > 0) {
        data.forEach(item => {
          if (item.section_id === "hero" && item.data) setHero(item.data)
          if (item.section_id === "education" && item.data) setEducation(item.data)
          if (item.section_id === "achievements" && item.data) setAchievements(item.data)
          if (item.section_id === "experiences" && item.data) setExperiences(item.data)
          if (item.section_id === "skills" && item.data) setSkills(item.data)
          if (item.section_id === "projects" && item.data) setProjects(item.data)
          if (item.section_id === "videos" && item.data) setVideos(item.data)
          if (item.section_id === "contact" && item.data) setContact(item.data)
          if (item.section_id === "footer" && item.data) setFooter(item.data)
        })
      } else {
        // Fallback to localStorage if Supabase is empty
        const localHero = localStorage.getItem("portfolio_hero")
        if (localHero) setHero(JSON.parse(localHero))

        const localEdu = localStorage.getItem("portfolio_education")
        if (localEdu) setEducation(JSON.parse(localEdu))

        const localAch = localStorage.getItem("portfolio_achievements")
        if (localAch) setAchievements(JSON.parse(localAch))

        const localExp = localStorage.getItem("portfolio_experiences")
        if (localExp) setExperiences(JSON.parse(localExp))

        const localSkills = localStorage.getItem("portfolio_skills")
        if (localSkills) setSkills(JSON.parse(localSkills))

        const localProjects = localStorage.getItem("portfolio_projects")
        if (localProjects) setProjects(JSON.parse(localProjects))

        const localVideos = localStorage.getItem("portfolio_videos")
        if (localVideos) setVideos(JSON.parse(localVideos))

        const localContact = localStorage.getItem("portfolio_contact")
        if (localContact) setContact(JSON.parse(localContact))

        const localFooter = localStorage.getItem("portfolio_footer")
        if (localFooter) setFooter(JSON.parse(localFooter))
      }
    } catch (err) {
      console.warn("PortfolioContext: Supabase table missing or error, using localStorage / defaults:", err)
      const localHero = localStorage.getItem("portfolio_hero")
      if (localHero) setHero(JSON.parse(localHero))

      const localProjects = localStorage.getItem("portfolio_projects")
      if (localProjects) setProjects(JSON.parse(localProjects))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllContent()
  }, [fetchAllContent])

  // Helper to save section data
  const saveSection = async (sectionId: string, data: any, localStorageKey: string) => {
    localStorage.setItem(localStorageKey, JSON.stringify(data))
    try {
      const { error } = await supabase
        .from("portfolio_content")
        .upsert({ section_id: sectionId, data, updated_at: new Date().toISOString() })
      if (error) console.warn(`Supabase save for ${sectionId} error:`, error.message)
    } catch (e) {
      console.warn(`Supabase save fallback for ${sectionId}:`, e)
    }
  }

  const updateHero = async (data: HeroData) => {
    setHero(data)
    await saveSection("hero", data, "portfolio_hero")
  }

  const updateEducation = async (data: EducationItem[]) => {
    setEducation(data)
    await saveSection("education", data, "portfolio_education")
  }

  const updateAchievements = async (data: AchievementItem[]) => {
    setAchievements(data)
    await saveSection("achievements", data, "portfolio_achievements")
  }

  const updateExperiences = async (data: ExperienceItem[]) => {
    setExperiences(data)
    await saveSection("experiences", data, "portfolio_experiences")
  }

  const updateSkills = async (data: Skill[]) => {
    setSkills(data)
    await saveSection("skills", data, "portfolio_skills")
  }

  const updateProjects = async (data: ProjectItem[]) => {
    setProjects(data)
    await saveSection("projects", data, "portfolio_projects")
  }

  const updateVideos = async (data: VideoItem[]) => {
    setVideos(data)
    await saveSection("videos", data, "portfolio_videos")
  }

  const updateContact = async (data: ContactData) => {
    setContact(data)
    await saveSection("contact", data, "portfolio_contact")
  }

  const updateFooter = async (data: FooterData) => {
    setFooter(data)
    await saveSection("footer", data, "portfolio_footer")
  }

  // 🌱 Seed 100% initial data into Supabase
  const seedDataToSupabase = async () => {
    try {
      setIsSeeding(true)
      const sections = [
        { section_id: "hero", data: hero },
        { section_id: "education", data: education },
        { section_id: "achievements", data: achievements },
        { section_id: "experiences", data: experiences },
        { section_id: "skills", data: skills },
        { section_id: "projects", data: projects },
        { section_id: "videos", data: videos },
        { section_id: "contact", data: contact },
        { section_id: "footer", data: footer },
      ]

      for (const sec of sections) {
        await saveSection(sec.section_id, sec.data, `portfolio_${sec.section_id}`)
      }
      alert("✅ All portfolio data successfully seeded to Supabase and LocalStorage!")
    } catch (err: any) {
      console.error("Seeding error:", err)
      alert(`Seeding failed: ${err.message || "Make sure the 'portfolio_content' table is created in Supabase SQL editor."}`)
    } finally {
      setIsSeeding(false)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset all portfolio data to original defaults?")) return
    setHero(initialHeroData)
    setEducation(defaultEducation)
    setAchievements(initialAchievementsData)
    setExperiences(defaultExperiences)
    setSkills(defaultSkills)
    setProjects(defaultProjects)
    setVideos(defaultVideos)
    setContact(initialContactData)
    setFooter(initialFooterData)
    
    await seedDataToSupabase()
  }

  return (
    <PortfolioContext.Provider value={{
      hero,
      education,
      achievements,
      experiences,
      skills,
      projects,
      videos,
      contact,
      footer,
      isLoading,
      isSeeding,
      updateHero,
      updateEducation,
      updateAchievements,
      updateExperiences,
      updateSkills,
      updateProjects,
      updateVideos,
      updateContact,
      updateFooter,
      seedDataToSupabase,
      resetToDefaults
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider")
  }
  return context
}
