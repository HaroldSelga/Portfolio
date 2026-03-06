import { Play, Clapperboard, Film } from "lucide-react"
import { useState } from "react"
import { Badge } from "../ui/Badge"
import { motion, AnimatePresence } from "framer-motion"

export function Videos() {
    const [activeFilter, setActiveFilter] = useState<string>("ALL")
    const filters = ["ALL", "PROFESSIONAL WORK", "HOBBIES"]

    const videos = [
        {
            title: "TRB System Demo 1",
            id: "vQVZKAIgeUQ",
            category: "PROFESSIONAL WORK",
            description: "Showcasing the core logistics and courier management dashboard features."
        },
        {
            title: "TRB Workflow Process",
            id: "zAoN6E6c6no",
            category: "PROFESSIONAL WORK",
            description: "Detailed walkthrough of the automated parcel tracking and branch administration."
        },
        {
            title: "TRB Internal Systems",
            id: "jlxvA0AcvzU",
            category: "PROFESSIONAL WORK",
            description: "A deep dive into the backend management and database interactions for TRB."
        },
        {
            title: "iDeliver Service Highlights",
            id: "uYr1riTEZhQ",
            category: "PROFESSIONAL WORK",
            description: "The official service highlights and user interface overview for iDeliver."
        },
        {
            title: "Hobby Project: Edit 1",
            id: "gcXusbcqGsU",
            category: "HOBBIES",
            description: "Exploring creative video editing and visual effects in my free time."
        },
        {
            title: "Hobby Project: Edit 2",
            id: "9l1OJsgfy0s",
            category: "HOBBIES",
            description: "Experimenting with pacing, transitions, and sound design."
        },
        {
            title: "Creative Exploration",
            id: "_IcAbmCnc6c",
            category: "HOBBIES",
            description: "A compilation of visual experiments and storytelling through video."
        },
        {
            title: "Life in Motion",
            id: "rnRfD0PMHSo",
            category: "HOBBIES",
            description: "Capturing moments and refining my cinematography skills."
        },
        {
            title: "Personal Highlights",
            id: "n37qWqCt52U",
            category: "HOBBIES",
            description: "A collection of personal favorites and creative milestones."
        }
    ]

    const filteredVideos = videos.filter(
        (vid) => activeFilter === "ALL" || vid.category === activeFilter
    )

    return (
        <section id="media" className="w-full py-12 md:py-24 lg:py-32 bg-background border-t">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl inline-block bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text uppercase">
                            Multimedia & Gallery
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            A visual collection of my professional work and personal creative hobbies.
                        </p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-2 mb-12"
                >
                    {filters.map((filter) => (
                        <Badge
                            key={filter}
                            variant={activeFilter === filter ? "default" : "outline"}
                            className="cursor-pointer text-sm px-4 py-1.5 transition-colors"
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </Badge>
                    ))}
                </motion.div>

                <div className="max-w-6xl mx-auto">
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredVideos.map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    layout
                                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2, delay: (index % 3) * 0.1 }}
                                    className="flex flex-col group overflow-hidden rounded-2xl border bg-card hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                                >
                                    {/* Video Container */}
                                    <div className="relative aspect-video bg-muted overflow-hidden">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${video.id}`}
                                            title={video.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="transition-transform duration-500 group-hover:scale-105"
                                        ></iframe>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                    {video.category === "PROFESSIONAL WORK" ? (
                                                        <Clapperboard className="h-4 w-4" />
                                                    ) : (
                                                        <Film className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                    {video.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                                                {video.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                                            <Badge variant="secondary" className="text-[10px] font-medium tracking-wider">
                                                {video.category}
                                            </Badge>
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                            >
                                                View on YouTube <Play className="h-3 w-3 fill-current" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
