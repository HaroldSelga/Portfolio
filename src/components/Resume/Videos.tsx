import { Play, Clapperboard, Film, Sparkles, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Badge } from "../ui/Badge"
import { motion, AnimatePresence } from "framer-motion"
import { videoData, videoFilters } from "../../data/videos"

export function Videos() {
    const [activeFilter, setActiveFilter] = useState<string>("ALL")

    const filteredVideos = videoData.filter(
        (vid) => activeFilter === "ALL" || vid.category === activeFilter
    )

    return (
        <section id="media" className="w-full py-20 md:py-32 bg-muted/20 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />

            <div className="container px-4 md:px-6 mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-12 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mx-auto">
                        <Sparkles className="h-3 w-3" />
                        <span>Gallery</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent">Multimedia & Gallery</span>
                    </h2>
                    <p className="max-w-lg mx-auto text-muted-foreground md:text-lg font-medium">
                        A visual showcase of professional work and creative explorations.
                    </p>
                </motion.div>

                {/* Filter Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-2 mb-12"
                >
                    {videoFilters.map((filter: string) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${activeFilter === filter
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                    : "bg-background border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/50"
                                }`}
                        >
                            {filter === "PROFESSIONAL WORK" ? "Professional" : filter === "HOBBIES" ? "Personal" : "All"}
                        </button>
                    ))}
                </motion.div>

                {/* Video Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                layout
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                                transition={{ duration: 0.4, type: "spring", bounce: 0.2, delay: (index % 3) * 0.08 }}
                                className="group"
                            >
                                <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                    {/* Video / Placeholder */}
                                    <div className="relative aspect-video bg-muted overflow-hidden">
                                        {video.id.startsWith("placeholder") ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground gap-3">
                                                <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/30">
                                                    <Clapperboard className="h-8 w-8 opacity-30" />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">Coming Soon</span>
                                            </div>
                                        ) : (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                loading="lazy"
                                                className="transition-transform duration-500 group-hover:scale-[1.02]"
                                            ></iframe>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-xl shrink-0 ${video.category === "PROFESSIONAL WORK" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>
                                                {video.category === "PROFESSIONAL WORK" ? (
                                                    <Clapperboard className="h-4 w-4" />
                                                ) : (
                                                    <Film className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors truncate">
                                                    {video.title}
                                                </h3>
                                                <Badge
                                                    variant="secondary"
                                                    className={`mt-1 text-[10px] font-bold tracking-wider border-none ${video.category === "PROFESSIONAL WORK"
                                                            ? "bg-blue-500/10 text-blue-500"
                                                            : "bg-purple-500/10 text-purple-500"
                                                        }`}
                                                >
                                                    {video.category === "PROFESSIONAL WORK" ? "Professional" : "Personal"}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                                            {video.description.split("\n")[0]}
                                        </p>

                                        {/* Footer */}
                                        {!video.id.startsWith("placeholder") && (
                                            <div className="pt-3 border-t border-border/30">
                                                <a
                                                    href={`https://www.youtube.com/watch?v=${video.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group/link"
                                                >
                                                    <Play className="h-3 w-3 fill-current" />
                                                    <span>Watch on YouTube</span>
                                                    <ExternalLink className="h-3 w-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    )
}
