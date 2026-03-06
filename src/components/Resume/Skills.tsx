import { useState, type ReactNode } from "react"
import { Badge } from "../ui/Badge"
import { motion, AnimatePresence } from "framer-motion"
import {
    Terminal, Database, Globe, Box, BrainCircuit, Layers, Server, Code2, Video
} from "lucide-react"

import {
    FaPhp, FaPython, FaReact, FaBootstrap, FaHtml5, FaLaravel,
    FaNodeJs, FaDocker, FaUbuntu, FaGithub, FaFigma, FaJava,
    FaMicrosoft, FaCloudflare, FaCss3Alt, FaLaptopCode
} from "react-icons/fa"

import {
    DiJavascript1, DiMysql, DiPostgresql, DiMongodb,
    DiNginx, DiPhotoshop, DiVisualstudio
} from "react-icons/di"

import {
    SiTypescript, SiCplusplus, SiTailwindcss, SiExpress, SiFirebase,
    SiPostman, SiMariadb, SiExpo
} from "react-icons/si"

type Skill = {
    name: string;
    icon: ReactNode;
    category: string;
    subCategory: string;
}

export function Skills() {
    const [activeFilter, setActiveFilter] = useState<string>("All")
    const filters = ["All", "Languages", "Frontend", "Backend", "Databases", "DevOps", "Tools", "Design"]

    const allSkills: Skill[] = [
        // Languages
        { name: "PHP", icon: <FaPhp />, category: "Languages", subCategory: "Primary" },
        { name: "JavaScript", icon: <DiJavascript1 />, category: "Languages", subCategory: "Primary" },
        { name: "TypeScript", icon: <SiTypescript />, category: "Languages", subCategory: "Primary" },
        { name: "Python", icon: <FaPython />, category: "Languages", subCategory: "Secondary" },
        { name: "C#", icon: <FaMicrosoft />, category: "Languages", subCategory: "Secondary" },
        { name: "C++", icon: <SiCplusplus />, category: "Languages", subCategory: "Secondary" },
        { name: "Java", icon: <FaJava />, category: "Languages", subCategory: "Secondary" },
        { name: "Visual Basic", icon: <FaMicrosoft />, category: "Languages", subCategory: "Secondary" },

        // Frontend
        { name: "React", icon: <FaReact />, category: "Frontend", subCategory: "Core" },
        { name: "React Native (Expo)", icon: <SiExpo />, category: "Frontend", subCategory: "Core" },
        { name: "Tailwind CSS", icon: <SiTailwindcss />, category: "Frontend", subCategory: "Styling" },
        { name: "Bootstrap", icon: <FaBootstrap />, category: "Frontend", subCategory: "Styling" },
        { name: "HTML5", icon: <FaHtml5 />, category: "Frontend", subCategory: "Styling" },
        { name: "CSS3", icon: <FaCss3Alt />, category: "Frontend", subCategory: "Styling" },
        { name: "Axios", icon: <Code2 />, category: "Frontend", subCategory: "State & Data" },

        // Backend
        { name: "Laravel", icon: <FaLaravel />, category: "Backend", subCategory: "Frameworks" },
        { name: "REST APIs", icon: <Globe />, category: "Backend", subCategory: "API Architecture" },
        { name: "JSON", icon: <Code2 />, category: "Backend", subCategory: "API Architecture" },
        { name: "Node.js", icon: <FaNodeJs />, category: "Backend", subCategory: "Environments" },
        { name: "Express", icon: <SiExpress />, category: "Backend", subCategory: "Environments" },

        // Databases
        { name: "MySQL", icon: <DiMysql />, category: "Databases", subCategory: "Relational (SQL)" },
        { name: "PostgreSQL", icon: <DiPostgresql />, category: "Databases", subCategory: "Relational (SQL)" },
        { name: "MariaDB", icon: <SiMariadb />, category: "Databases", subCategory: "Relational (SQL)" },
        { name: "MongoDB", icon: <DiMongodb />, category: "Databases", subCategory: "NoSQL" },
        { name: "Firebase Firestore", icon: <SiFirebase />, category: "Databases", subCategory: "NoSQL" },

        // DevOps
        { name: "Ubuntu Linux", icon: <FaUbuntu />, category: "DevOps", subCategory: "Operating Systems" },
        { name: "WSL2", icon: <Terminal />, category: "DevOps", subCategory: "Operating Systems" },
        { name: "Docker", icon: <FaDocker />, category: "DevOps", subCategory: "Containerization" },
        { name: "Docker Compose", icon: <Box />, category: "DevOps", subCategory: "Containerization" },
        { name: "Coolify", icon: <Server />, category: "DevOps", subCategory: "Deployment & Hosting" },
        { name: "cPanel", icon: <Globe />, category: "DevOps", subCategory: "Deployment & Hosting" },
        { name: "Vercel", icon: <Globe />, category: "DevOps", subCategory: "Deployment & Hosting" },
        { name: "Cloudflare", icon: <FaCloudflare />, category: "DevOps", subCategory: "Cloud & Networking" },
        { name: "GoDaddy", icon: <Globe />, category: "DevOps", subCategory: "Cloud & Networking" },
        { name: "Apache", icon: <Server />, category: "DevOps", subCategory: "Web Servers" },
        { name: "Nginx", icon: <DiNginx />, category: "DevOps", subCategory: "Web Servers" },

        // Tools
        { name: "Git", icon: <FaGithub />, category: "Tools", subCategory: "Version Control" },
        { name: "GitHub", icon: <FaGithub />, category: "Tools", subCategory: "Version Control" },
        { name: "XAMPP", icon: <Database />, category: "Tools", subCategory: "Local Servers" },
        { name: "VS Code", icon: <DiVisualstudio />, category: "Tools", subCategory: "IDEs/Editors" },
        { name: "Visual Studio", icon: <DiVisualstudio />, category: "Tools", subCategory: "IDEs/Editors" },
        { name: "Eclipse", icon: <FaLaptopCode />, category: "Tools", subCategory: "IDEs/Editors" },
        { name: "Postman", icon: <SiPostman />, category: "Tools", subCategory: "API Testing" },
        { name: "LLM Prompting", icon: <BrainCircuit />, category: "Tools", subCategory: "AI/Productivity" },

        // Design
        { name: "Figma", icon: <FaFigma />, category: "Design", subCategory: "UI/UX" },
        { name: "Adobe Photoshop", icon: <DiPhotoshop />, category: "Design", subCategory: "Graphics" },
        { name: "Wondershare Filmora", icon: <Video />, category: "Design", subCategory: "Video Editing" },
    ]

    const categoryTitles: Record<string, string> = {
        "Languages": "Programming & Scripting Languages",
        "Frontend": "Frontend Frameworks & Libraries",
        "Backend": "Backend & Server-Side",
        "Databases": "Database Management Systems",
        "DevOps": "Infrastructure & DevOps",
        "Tools": "Development Tools & Version Control",
        "Design": "Design & Multimedia"
    }

    const categoriesToRender = activeFilter === "All"
        ? filters.filter(f => f !== "All")
        : [activeFilter]

    return (
        <section id="skills" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20 overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl inline-block bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text flex items-center justify-center gap-3">
                            <Layers className="h-8 w-8 text-primary" />
                            Technical Arsenal
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            My comprehensive ecosystem across languages, infrastructure, and design.
                        </p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-2 mb-10"
                >
                    {filters.map((filter) => (
                        <Badge
                            key={filter}
                            variant={activeFilter === filter ? "default" : "outline"}
                            className="cursor-pointer text-sm px-4 py-2 transition-all hover:scale-105"
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </Badge>
                    ))}
                </motion.div>

                {/* Big Icon Grid grouped by categories */}
                <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full min-h-[300px]">
                    <AnimatePresence mode="popLayout">
                        {categoriesToRender.map((category) => {
                            const skillsInCat = allSkills.filter(s => s.category === category)
                            if (skillsInCat.length === 0) return null

                            // Group by subcategory
                            const grouped = skillsInCat.reduce((acc, skill) => {
                                const sub = skill.subCategory
                                if (!acc[sub]) acc[sub] = []
                                acc[sub].push(skill)
                                return acc
                            }, {} as Record<string, Skill[]>)

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    key={category}
                                    className="flex flex-col w-full"
                                >
                                    <h3 className="text-2xl sm:text-3xl font-bold border-b pb-3 mb-6 text-foreground/90 flex items-center gap-3">
                                        <Layers className="h-6 w-6 text-primary" />
                                        {categoryTitles[category] || category}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
                                        {Object.entries(grouped).map(([subCat, skills]) => (
                                            <div key={subCat} className="flex flex-col gap-4 bg-card/40 border border-border/50 rounded-2xl p-5 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2 border-b border-border/40 pb-2">
                                                    <h4 className="text-[13px] sm:text-sm font-bold text-primary uppercase tracking-widest">
                                                        {subCat}
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {skills.map((skill) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            whileInView={{ opacity: 1, scale: 1 }}
                                                            viewport={{ once: true }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            whileHover={{ y: -3, scale: 1.05 }}
                                                            transition={{ duration: 0.2 }}
                                                            key={`${category}-${skill.name}`}
                                                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 w-full group"
                                                        >
                                                            <div className="text-3xl sm:text-4xl mb-2 text-primary/70 group-hover:text-primary transition-colors duration-300 drop-shadow-sm flex items-center justify-center">
                                                                {skill.icon}
                                                            </div>
                                                            <h3 className="text-[10px] sm:text-[11px] font-medium text-center leading-tight break-words px-1 w-full">
                                                                {skill.name}
                                                            </h3>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
