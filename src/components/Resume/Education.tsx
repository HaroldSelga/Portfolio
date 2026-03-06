import { GraduationCap, Award, BookOpen } from "lucide-react"
import { Badge } from "../ui/Badge"
import { LocationLink } from "../ui/LocationLink"
import { motion } from "framer-motion"

const educationData = [
    {
        degree: "Bachelor of Science in Information & Technology",
        school: "College for Research and Technology",
        location: "Burgos Ave, Cabanatuan City, Nueva Ecija",
        query: "College+for+Research+and+Technology+Cabanatuan",
        period: "2018 - 2022",
        level: "College",
        icon: GraduationCap
    },
    {
        degree: "Information Communication & Technology",
        school: "College for Research and Technology",
        location: "Burgos Ave, Cabanatuan City, Nueva Ecija",
        query: "College+for+Research+and+Technology+Cabanatuan",
        period: "2016 - 2018",
        level: "Vocational / Trade Course",
        icon: BookOpen
    },
    {
        degree: "High School",
        school: "Nueva Ecija High School",
        location: "Burgos Ave, Cabanatuan City, Nueva Ecija",
        query: "Nueva+Ecija+High+School+Cabanatuan",
        period: "2012 - 2016",
        level: "Secondary",
        icon: BookOpen
    },
    {
        degree: "Elementary",
        school: "Lazaro Francisco Integrated School",
        location: "Cabanatuan City, Nueva Ecija",
        query: "Lazaro+Francisco+Integrated+School+Cabanatuan",
        period: "2007 - 2013",
        level: "Elementary",
        icon: BookOpen
    }
]

export function Education() {
    return (
        <section id="education" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20">
            <div className="container px-4 md:px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl inline-block bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                            Educational Background
                        </h2>
                    </div>
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Education Timeline */}
                    <div className="relative pl-8 md:pl-0 space-y-6">
                        {/* Timeline line for desktop */}
                        <div className="hidden md:block absolute left-[21px] top-8 bottom-8 w-0.5 bg-border z-0"></div>

                        {educationData.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="md:flex w-full bg-card p-6 rounded-xl border shadow-sm relative z-10 transition-all hover:shadow-md md:pl-12"
                            >
                                <div className="hidden md:flex absolute left-[-16px] top-6 h-10 w-10 rounded-full bg-primary/10 border-4 border-background items-center justify-center z-20">
                                    <item.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div>
                                            <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">
                                                {item.level}
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold">{item.degree}</h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                                                <span className="text-foreground/90 font-medium text-sm md:text-base">{item.school}</span>
                                                <span className="hidden sm:inline text-muted-foreground">•</span>
                                                <LocationLink
                                                    location={item.location}
                                                    query={item.query}
                                                    className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:mt-0 flex-shrink-0 text-left sm:text-right">
                                            <Badge variant="secondary" className="text-sm font-medium">{item.period}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Certifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.4 }}
                    >
                        <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Achievements & Certificates
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                                <div className="font-semibold text-sm text-primary mb-1">2021</div>
                                <p className="font-medium">NATIONAL CERTIFICATE II</p>
                                <p className="text-sm text-muted-foreground mt-1">COMPUTER SYSTEM SERVICES</p>
                            </div>
                            <div className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                                <div className="font-semibold text-sm text-primary mb-1">2021</div>
                                <p className="font-medium">NATIONAL CERTIFICATE III</p>
                                <p className="text-sm text-muted-foreground mt-1">EVENTS MANAGEMENT SERVICES</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
