import { ExternalLink, Github, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "../ui/Badge"
import { projects } from "../../data/projects"

export function Projects() {
    return (
        <section id="projects" className="w-full py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />

            <div className="container px-4 md:px-6 mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16 md:mb-20 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mx-auto">
                        <Sparkles className="h-3 w-3" />
                        <span>Portfolio</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">Featured Projects</span>
                    </h2>
                    <p className="max-w-lg mx-auto text-muted-foreground md:text-lg font-medium">
                        Real-world systems I've designed, developed, and deployed.
                    </p>
                </motion.div>

                {/* Project Cards - Stacked Case Study Style */}
                <div className="space-y-12 md:space-y-16">
                    {projects.map((project, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6, delay: idx * 0.15 }}
                            className="group"
                        >
                            <div className={`relative rounded-3xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/5`}>
                                {/* Gradient accent line */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                    {/* Image Side */}
                                    <div className={`relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Floating Action on Image */}
                                        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-primary hover:bg-white dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-lg"
                                                aria-label={`Visit ${project.title} live demo`}
                                            >
                                                <ExternalLink className="h-5 w-5" />
                                            </a>
                                            {project.githubUrl !== "#" && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-foreground hover:bg-white dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-lg"
                                                    aria-label={`View ${project.title} on GitHub`}
                                                >
                                                    <Github className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-primary transition-colors duration-300">
                                                {project.title}
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                                                {project.description}
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-xs font-bold px-3 py-1 bg-muted/60 border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 pt-2">
                                            <a
                                                href={project.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Live Demo
                                            </a>
                                            {project.githubUrl !== "#" && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/80 font-bold text-sm hover:bg-muted hover:border-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                                >
                                                    <Github className="h-4 w-4" />
                                                    Source
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
