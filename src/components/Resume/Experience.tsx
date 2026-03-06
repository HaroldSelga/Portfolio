import { Briefcase } from "lucide-react"
import { useState } from "react"
import { Badge } from "../ui/Badge"
import { motion, AnimatePresence } from "framer-motion"
import { LocationLink } from "../ui/LocationLink"

export function Experience() {
    const [activeFilter, setActiveFilter] = useState<string>("ALL")
    const filters = ["ALL", "WORK EXPERIENCE", "OJT", "WORK IMMERSION"]

    const experiences = [
        {
            role: "Web Developer",
            company: "MUNICIPALITY OF SANTA ROSA",
            location: "Santa Rosa, Nueva Ecija",
            locationUrl: "https://maps.google.com/?q=Santa+Rosa+Municipal+Hall+Nueva+Ecija",
            duration: "January 05, 2026 - PRESENT",
            tag: "WORK EXPERIENCE",
            description: [
                "Responsible for the maintenance and development of municipal web applications and digital assets.",
                "Ensuring web infrastructure uptime and optimizing performance for public-facing services.",
                "Collaborating with department heads to digitize administrative workflows and public information systems."
            ],
        },
        {
            role: "FIELD ASSESSMENT AIDE II",
            company: "PROVINCIAL ASSESSOR'S OFFICE",
            location: "Old Capitol, Burgos Ave, Cabanatuan City, Nueva Ecija",
            locationUrl: "https://maps.google.com/?q=Old+Capitol,+Burgos+Ave,+Cabanatuan+City,+Nueva+Ecija",
            duration: "March 01, 2024 - January 01, 2026",
            tag: "WORK EXPERIENCE",
            description: [
                "Responsible for assisting in field assessments and data verification for real property appraisal.",
                "Conducted site inspections and data collection to update property tax records and assessments.",
                "Maintained and updated geographic and descriptive data for property inventory.",
                "Coordinated with local assessor units for streamlined provincial property mapping."
            ],
        },
        {
            role: "I.T SUPERVISOR JR / WEB DEVELOPER",
            company: "TRB EXPRESS INC.",
            location: "Arems Place, Binmaley, Pangasinan, Philippines",
            locationUrl: "https://maps.google.com/?q=Buenlag,+Binmaley,+Pangasinan",
            duration: "October 01, 2022 – November 08, 2023",
            tag: "WORK EXPERIENCE",
            description: [
                "Responsible for the development and improvement of current logistics system, using Laravel PHP, Flutter, Postman.",
                "Responsible for the training of branch administrator on how to use the system using zoom and going to their branch.",
                "Responsible for overseeing the database model and managing the MySQL database."
            ],
        },
        {
            role: "OJT",
            company: "GOODSAM MEDICAL CENTER",
            location: "Cabanatuan City, Nueva Ecija",
            locationUrl: "https://maps.google.com/?q=GOODSAM+MEDICAL+CENTER+Cabanatuan+City,+Nueva+Ecija",
            duration: "240 Hours 2019-2020",
            tag: "OJT",
            description: [
                "Responsible for addressing technical issues, including printer troubleshooting, stage setup, and deep cleaning of computers.",
                "Responsible for inputting provided data from the admin/cashier into the database using SQL."
            ],
        },
        {
            role: "OJT",
            company: "COMELEC CABANATUAN",
            location: "Cabanatuan City, Nueva Ecija",
            locationUrl: "https://maps.google.com/?q=COMELEC+Cabanatuan+City,+Nueva+Ecija",
            duration: "240 Hours 2020-2021",
            tag: "OJT",
            description: [
                "Responsible for preparing the machine for voting and setup.",
                "Data Encode."
            ],
        },
        {
            role: "WORK IMMERSION",
            company: "BISTRO 1996",
            location: "Cabanatuan City, Nueva Ecija",
            locationUrl: "https://maps.google.com/?q=Bistro+1996+Cabanatuan+City,+Nueva+Ecija",
            duration: "80 Hours 2017-2018",
            tag: "WORK IMMERSION",
            description: [
                "Responsible for utilizing Photoshop to design and create banners, invitation cards, and other graphical materials."
            ],
        }
    ]

    const filteredExperiences = experiences.filter(
        (exp) => activeFilter === "ALL" || exp.tag === activeFilter
    )

    return (
        <section id="experience" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl inline-block bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                            Professional Experience
                        </h2>
                        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                            My career journey across full-time roles, internships, and immersions.
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

                <div className="max-w-5xl mx-auto">
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        <AnimatePresence mode="popLayout">
                            {filteredExperiences.map((exp, index) => (
                                <motion.div
                                    key={`${exp.company}-${exp.role}`}
                                    layout
                                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2, delay: (index % 2) * 0.1 }}
                                    className="flex flex-col p-6 rounded-2xl border bg-card hover:shadow-xl hover:border-primary/40 transition-all duration-300 group"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3 items-center">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold tracking-tight text-foreground">{exp.company}</h3>
                                                <h4 className="text-[15px] font-semibold text-primary">{exp.role}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <LocationLink
                                        location={exp.location}
                                        query={exp.locationUrl.split("?q=")[1]}
                                        className="mt-1 text-[13px] text-muted-foreground w-fit mb-4"
                                        iconClassName="h-3.5 w-3.5"
                                    />

                                    {/* Description - takes remaining space */}
                                    <ul className="space-y-2 text-[14px] text-foreground/80 flex-1 mb-6 mt-1 line-clamp-[8] hover:line-clamp-none transition-all">
                                        {exp.description.map((item, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-primary/70 mt-[2px] shrink-0 text-sm leading-none select-none">•</span>
                                                <span className="leading-relaxed text-justify">{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Footer */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50 mt-auto">
                                        <Badge variant="secondary" className="text-xs font-normal bg-secondary">
                                            {exp.duration}
                                        </Badge>
                                        <Badge variant="outline" className="text-[11px] border-primary/20 text-primary/80">
                                            {exp.tag}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredExperiences.length === 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-muted-foreground py-12 w-full"
                        >
                            No experiences found for this category.
                        </motion.p>
                    )}
                </div>
            </div>
        </section>
    )
}
