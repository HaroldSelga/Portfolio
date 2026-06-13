import { ExternalLink, Github, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Badge } from "../ui/Badge"
import { projects, type ProjectItem } from "../../data/projects"
import { Modal } from "../ui/Modal"

export function Projects() {
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)

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
                        <span>Portfolio</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">Featured Projects</span>
                    </h2>
                    <p className="max-w-lg mx-auto text-muted-foreground md:text-lg font-medium">
                        Real-world systems I've designed, developed, and deployed.
                    </p>
                </motion.div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                    {projects.map((project, idx) => (
                        <ProjectCard key={idx} project={project} idx={idx} onSelect={() => setSelectedProject(project)} />
                    ))}
                </div>
            </div>

            {/* Project Details Modal */}
            <Modal
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                title={selectedProject?.title || ""}
                className="max-w-6xl"
            >
                {selectedProject && <ProjectDetails project={selectedProject} />}
            </Modal>
        </section>
    )
}

function ProjectCard({ project, idx, onSelect }: { project: ProjectItem, idx: number, onSelect: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group cursor-pointer"
            onClick={onSelect}
        >
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                {/* Image backdrop with zoom */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Quick View Prompt */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Maximize2 className="h-4 w-4" />
                            View Details
                        </div>
                    </div>

                    {/* Tags overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} className="bg-white/10 backdrop-blur-md border-white/20 text-white text-[10px] font-bold py-0.5">
                                {tag}
                            </Badge>
                        ))}
                        {project.tags.length > 3 && (
                            <Badge className="bg-black/40 backdrop-blur-md border-white/10 text-white text-[10px] font-bold py-0.5">
                                +{project.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {project.title}
                        </h3>
                        <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${project.accent}`} />
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {project.description}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

function ProjectDetails({ project }: { project: ProjectItem }) {
    const [currentImageIdx, setCurrentImageIdx] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [activeTabIdx, setActiveTabIdx] = useState(0)

    const hasTabs = project.tabs && project.tabs.length > 0
    const currentTab = hasTabs ? project.tabs![activeTabIdx] : null

    // Resolve images, description and features based on active tab or fallback
    const images = hasTabs 
        ? (currentTab?.images && currentTab.images.length > 0 ? currentTab.images : [project.image])
        : (project.images && project.images.length > 0 ? project.images : [project.image])

    const description = hasTabs ? currentTab?.description : project.description
    const features = hasTabs ? currentTab?.features : project.features

    // Reset current image index when switching tabs
    useEffect(() => {
        setCurrentImageIdx(0)
    }, [activeTabIdx])

    const nextImage = (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setCurrentImageIdx((prev) => (prev + 1) % images.length)
    }

    const prevImage = (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length)
    }

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isZoomed) {
                if (e.key === "Escape") setIsZoomed(false)
            }
            if (e.key === "ArrowRight") nextImage()
            if (e.key === "ArrowLeft") prevImage()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentImageIdx, isZoomed, images])

    return (
        <div className="flex flex-col h-full relative">
            {/* Full-Width Tab Navigation Bar */}
            {hasTabs && (
                <div className="bg-muted/40 border-b border-border/50 px-4 md:px-6">
                    <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
                        {project.tabs!.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTabIdx(i)}
                                className={`relative px-4 py-2 text-sm font-bold transition-all shrink-0 whitespace-nowrap rounded-lg ${
                                    i === activeTabIdx
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content: Image + Info Side by Side */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                {/* Carousel Side */}
                <div className="relative lg:w-3/5 bg-black/5 aspect-[16/10] lg:aspect-auto flex flex-col min-h-0">
                    <div
                        className="flex-1 relative overflow-hidden group/modal-img cursor-zoom-in"
                        onClick={() => setIsZoomed(true)}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={`${activeTabIdx}-${currentImageIdx}`}
                                src={images[currentImageIdx]}
                                alt={`${project.title} screenshot ${currentImageIdx + 1}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full object-contain p-4 md:p-8"
                            />
                        </AnimatePresence>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover/modal-img:opacity-100"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover/modal-img:opacity-100"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Image Counter Badge */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold tracking-wide">
                                {currentImageIdx + 1} / {images.length}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="p-3 bg-muted/30 border-t border-border/50 flex gap-2 overflow-x-auto">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImageIdx(i)}
                                    className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentImageIdx ? "border-primary scale-105 shadow-md ring-2 ring-primary/30" : "border-transparent opacity-50 hover:opacity-90"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content Side */}
                <div className="lg:w-2/5 flex flex-col lg:border-l border-border/50 overflow-y-auto max-h-full">
                    <div className="p-6 md:p-8 space-y-5 flex-1">
                        {/* Project title */}
                        <div>
                            <h3 className="text-2xl font-black tracking-tight leading-tight">{project.title}</h3>
                            {hasTabs && (
                                <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">{currentTab?.label}</span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed text-base">
                            {description}
                        </p>

                        {/* Key Features */}
                        {features && features.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary/70">Key Features</h4>
                                <ul className="space-y-3">
                                    {features.map((feature, i) => (
                                        <li key={i} className="flex gap-3 group/feature">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 group-hover/feature:bg-primary/20 transition-colors">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                            </div>
                                            <span className="text-sm text-muted-foreground leading-snug group-hover/feature:text-foreground transition-colors font-medium">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tech Stack */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary/70">Tech Stack</h4>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1 font-bold text-xs bg-primary/5 hover:bg-primary/10 border-primary/10 transition-colors">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - pinned to bottom */}
                    <div className="px-6 md:px-8 py-4 border-t border-border/40 bg-muted/20 flex items-center gap-3">
                        {project.liveUrl !== "#" && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Live Demo
                            </a>
                        )}
                        {project.githubUrl !== "#" && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border/80 font-bold text-sm hover:bg-muted hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <Github className="h-4 w-4" />
                                Source
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Zoom Overlay */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsZoomed(false)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center cursor-zoom-out p-4 md:p-8 lg:p-12"
                    >
                        <motion.img
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            src={images[currentImageIdx]}
                            alt={`${project.title} zoomed screenshot`}
                            className="w-full h-full object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
