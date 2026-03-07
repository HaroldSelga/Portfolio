import { Mail, Phone, MapPin, Download, Eye, ChevronDown, Sparkles, User } from "lucide-react"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { Badge } from "../ui/Badge"
import { useState, useEffect } from "react"
import { LocationLink } from "../ui/LocationLink"
import { motion, useScroll, useTransform } from "framer-motion"
import { socialLinks } from "../../data/social"

export default function Hero() {
    const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null)
    const [imageError, setImageError] = useState(false)
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const y2 = useTransform(scrollY, [0, 500], [0, -150])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    }

    const roles = ["Web Developer", "IT Professional", "Infrastructure", "Mobile Developer"]
    const [roleIndex, setRoleIndex] = useState(0)
    const [currentText, setCurrentText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [typingSpeed, setTypingSpeed] = useState(150)

    useEffect(() => {
        const handleTyping = () => {
            const currentRole = roles[roleIndex]
            if (isDeleting) {
                setCurrentText(currentRole.substring(0, currentText.length - 1))
                setTypingSpeed(50)
            } else {
                setCurrentText(currentRole.substring(0, currentText.length + 1))
                setTypingSpeed(150)
            }

            if (!isDeleting && currentText === currentRole) {
                setTimeout(() => setIsDeleting(true), 1500)
            } else if (isDeleting && currentText === "") {
                setIsDeleting(false)
                setRoleIndex((prev) => (prev + 1) % roles.length)
            }
        }

        const timer = setTimeout(handleTyping, typingSpeed)
        return () => clearTimeout(timer)
    }, [currentText, isDeleting, roleIndex, typingSpeed, roles])

    return (
        <section id="about" className="relative w-full min-h-screen flex items-center justify-center py-20 overflow-hidden bg-background">
            {/* Dynamic Background Blobs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    style={{ y: y1 }}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"
                />
                <motion.div
                    style={{ y: y2 }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[140px]"
                />
            </div>

            <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-14 lg:p-16 relative"
                >
                    {/* Top Right Decorative Element */}
                    <div className="absolute top-8 right-8 text-primary/20">
                        <Sparkles className="h-12 w-12" />
                    </div>

                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-16">

                        {/* Left Side: Content */}
                        <div className="flex-1 space-y-8 text-center lg:text-left order-2 lg:order-1">
                            <motion.div variants={itemVariants} className="space-y-4">
                                <Badge variant="outline" className="px-4 py-1.5 border-primary/30 text-primary bg-primary/5 rounded-full text-xs font-bold tracking-widest uppercase h-8 flex items-center justify-center lg:justify-start w-fit mx-auto lg:mx-0">
                                    <span className="min-w-[120px]">{currentText}</span>
                                    <span className="w-1 h-4 bg-primary ml-1 animate-pulse" />
                                </Badge>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                                    <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent uppercase">John Harold E. Selga</span>
                                </h1>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl font-medium leading-relaxed mx-auto lg:mx-0">
                                    Building seamless digital experiences with a focus on modern web ecosystems and infrastructure.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                {/* Resume Group */}
                                <div className="flex items-center shadow-lg hover:shadow-primary/20 transition-all rounded-full overflow-hidden border border-primary/20">
                                    <Button asChild className="rounded-none border-none bg-primary hover:bg-primary/90 px-6 h-12 font-bold group">
                                        <a href="/documents/Resume.pdf" download="John_Harold_Selga_Resume.pdf">
                                            <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                                            Resume
                                        </a>
                                    </Button>
                                    <button
                                        className="h-12 px-4 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center border-l border-primary/20 group"
                                        title="View Resume"
                                        aria-label="View Resume PDF in modal"
                                        onClick={() => setPreviewDoc({ title: "Resume Preview", url: "/documents/Resume.pdf" })}
                                    >
                                        <Eye className="h-4 w-4 text-primary transition-transform group-hover:scale-125" />
                                    </button>
                                </div>

                                {/* PDS Group */}
                                <div className="flex items-center shadow-lg hover:shadow-purple-500/20 transition-all rounded-full overflow-hidden border border-purple-500/20">
                                    <Button asChild variant="outline" className="rounded-none border-none bg-card hover:bg-muted px-6 h-12 font-bold group">
                                        <a href="/documents/PDS 2026.pdf" download="John_Harold_Selga_PDS_2026.pdf">
                                            <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                                            PDS 2026
                                        </a>
                                    </Button>
                                    <button
                                        className="h-12 px-4 bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex items-center justify-center border-l border-purple-500/20 group"
                                        title="View PDS"
                                        aria-label="View PDS PDF in modal"
                                        onClick={() => setPreviewDoc({ title: "PDS 2026 Preview", url: "/documents/PDS 2026.pdf" })}
                                    >
                                        <Eye className="h-4 w-4 text-purple-500 transition-transform group-hover:scale-125" />
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-white/10 max-w-md mx-auto lg:mx-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                                    <div className="flex items-center justify-center lg:justify-start group">
                                        <Mail className="h-4 w-4 text-primary mr-3 group-hover:scale-110 transition-transform" />
                                        <a href="mailto:johnselga18@gmail.com" className="hover:text-primary transition-colors">johnselga18@gmail.com</a>
                                    </div>
                                    <div className="flex items-center justify-center lg:justify-start group">
                                        <Phone className="h-4 w-4 text-primary mr-3 group-hover:scale-110 transition-transform" />
                                        <span>0936-3324-878</span>
                                    </div>
                                    <div className="flex items-center justify-center lg:justify-start group sm:col-span-2">
                                        <MapPin className="h-4 w-4 text-primary mr-3 group-hover:scale-110 transition-transform" />
                                        <LocationLink
                                            location="Matadero, Cabanatuan City, Nueva Ecija"
                                            query="Matadero, Cabanatuan City, Nueva Ecija"
                                        />
                                    </div>
                                </div>

                                {/* Social Icons */}
                                <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.name}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-2.5 rounded-xl bg-background border border-border transition-all duration-300 ${social.color} ${social.bgColor} hover:scale-110 hover:shadow-md group`}
                                            aria-label={social.name}
                                        >
                                            <social.icon className="h-5 w-5" />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Side: Profile Image */}
                        <motion.div
                            variants={itemVariants}
                            className="order-1 lg:order-2 flex-shrink-0 relative group"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-purple-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <div className="relative h-56 w-56 md:h-72 md:w-72 overflow-hidden rounded-[2.5rem] border-4 border-white/50 bg-muted shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                                {!imageError ? (
                                    <img
                                        src="/profile.jpg"
                                        alt="John Harold E. Selga"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <User className="h-24 w-24 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Decorative Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-4 -right-4 p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/50 text-primary font-bold text-xs"
                            >
                                <Sparkles className="h-4 w-4" />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Objective & Personal Details Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-16 border-t border-white/10 mt-12">
                        {/* Objective */}
                        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-4 text-center lg:text-left">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center justify-center lg:justify-start gap-3">
                                <span className="h-1.5 w-8 bg-primary rounded-full hidden lg:block"></span>
                                Professional Objective
                            </h3>
                            <p className="text-foreground/90 leading-relaxed text-lg font-medium">
                                Entry-level software developer seeking a position where I can apply my programming skills, learn new technologies, and gain real-world development experience. I am eager to grow as a developer while contributing to building efficient and reliable software solutions.
                            </p>
                        </motion.div>

                        {/* Personal Info */}
                        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 bg-primary/5 rounded-3xl p-6 border border-primary/10">
                            <div className="grid grid-cols-2 gap-y-4 text-sm text-center lg:text-left">
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-black mb-1">Birth Date</span>
                                    <span className="font-bold text-foreground">Mar 18, 2000</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-black mb-1">Gender</span>
                                    <span className="font-bold text-foreground">Male</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-black mb-1">Nationality</span>
                                    <span className="font-bold text-foreground">Filipino</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-black mb-1">Status</span>
                                    <span className="font-bold text-foreground">Single</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/60 transition-colors hover:text-primary"
            >
                <span className="text-[10px] font-black uppercase tracking-widest">Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ChevronDown className="h-5 w-5" />
                </motion.div>
            </motion.div>

            {/* Document Preview Modal */}
            <Modal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                title={previewDoc?.title || ""}
                className="max-w-6xl h-[95vh]"
            >
                {previewDoc && (
                    <iframe
                        src={`${previewDoc.url}#toolbar=0&navpanes=0`}
                        className="w-full h-full border-none rounded-xl"
                        title={previewDoc.title}
                    />
                )}
            </Modal>
        </section>
    )
}
