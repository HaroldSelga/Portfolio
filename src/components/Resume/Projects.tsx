import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card"
import { Badge } from "../ui/Badge"

export function Projects() {
    const projects = [
        {
            title: "IGIS - Municipality Portal",
            description: "Integrated Government Information System for Santa Rosa, Nueva Ecija. A comprehensive digital portal for municipal services, official announcements, and administrative dashboards.",
            image: "/projects/igis-portal.png",
            tags: ["Laravel", "React", "PostgreSQL", "TailwindCSS", "Cloudflare"],
            liveUrl: "https://app.simsportal.xyz/",
            githubUrl: "#",
        },
        {
            title: "TRB EXPRESS Inc. Logistics System",
            description: "A full-scale logistics and courier management platform for TRB Express Inc. Features automated parcel tracking, branch administration, and real-time delivery status updates.",
            image: "/projects/trb-express.png",
            tags: ["Laravel PHP", "Flutter", "MySQL", "REST API", "C-Panel"],
            liveUrl: "https://login.idelivertrb.com/",
            githubUrl: "#",
        },
    ]

    return (
        <section id="projects" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl inline-block bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                            Featured Projects
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            Some of the latest work I've built and shipped.
                        </p>
                    </div>
                </motion.div>
                <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                    {projects.map((project, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md flex"
                        >
                            <Card className="flex flex-col overflow-hidden border bg-background group hover:border-primary/50 transition-colors h-full">
                                <div className="relative aspect-video overflow-hidden bg-muted">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <a href={project.liveUrl} className="p-2 bg-background/90 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors" title="Live Preview">
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                                <CardHeader className="p-6">
                                    <CardTitle className="text-xl">{project.title}</CardTitle>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {project.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 flex-1">
                                    <CardDescription className="text-base text-muted-foreground text-justify">
                                        {project.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
