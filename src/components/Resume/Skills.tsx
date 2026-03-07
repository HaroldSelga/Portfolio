import { useState } from "react"
import { Badge } from "../ui/Badge"
import { motion, AnimatePresence } from "framer-motion"
import { Layers } from "lucide-react"
import { allSkills, categoryTitles, filters, type Skill } from "../../data/skills"

export function Skills() {
    const [activeFilter, setActiveFilter] = useState<string>("All")

    const categoriesToRender = activeFilter === "All"
        ? filters.filter((f: string) => f !== "All")
        : [activeFilter]

    return (
        <section id="skills" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20 overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto flex flex-col items-center">
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
                <div className="flex flex-col gap-10 max-w-6xl mx-auto w-full min-h-[300px] items-center">
                    <AnimatePresence mode="popLayout">
                        {categoriesToRender.map((category) => {
                            const skillsInCat = allSkills.filter((s: Skill) => s.category === category)
                            if (skillsInCat.length === 0) return null

                            // Group by subcategory
                            const grouped = skillsInCat.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
                                const sub = skill.subCategory || "Other"
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
                                    className="flex flex-col w-full items-center text-center"
                                >
                                    <h3 className="text-2xl sm:text-3xl font-bold border-b pb-3 mb-6 text-foreground/90 flex items-center gap-3 justify-center w-full">
                                        <Layers className="h-6 w-6 text-primary" />
                                        {categoryTitles[category] || category}
                                    </h3>

                                    <div className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full max-w-full">
                                        {Object.entries(grouped).map(([subCat, skills]) => (
                                            <div key={subCat} className="flex flex-col gap-4 bg-card/40 border border-border/50 rounded-2xl p-5 shadow-sm items-center text-center w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2rem)] min-w-[280px]">
                                                <div className="flex items-center gap-2 mb-2 border-b border-border/40 pb-2 w-full justify-center">
                                                    <h4 className="text-[13px] sm:text-sm font-bold text-primary uppercase tracking-widest">
                                                        {subCat}
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-4 w-full">
                                                    {skills.map((skill) => (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            whileInView={{ opacity: 1, scale: 1 }}
                                                            viewport={{ once: true }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            whileHover={{ y: -3, scale: 1.05 }}
                                                            transition={{ duration: 0.2 }}
                                                            key={`${category}-${skill.name}`}
                                                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 w-24 sm:w-28 group"
                                                        >
                                                            <div className="h-10 w-10 sm:h-12 sm:w-12 mb-2 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                                                                <img
                                                                    src={skill.icon}
                                                                    alt={skill.name}
                                                                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        if (target.src.includes('skillicons.dev')) {
                                                                            const name = skill.name.toLowerCase().replace(/\s+/g, '');
                                                                            target.src = `https://cdn.simpleicons.org/${name}`;
                                                                        } else {
                                                                            target.src = "https://www.svgrepo.com/show/354279/rest-api.svg";
                                                                        }
                                                                    }}
                                                                />
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
