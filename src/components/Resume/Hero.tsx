import { Mail, Phone, Github, Facebook, User, Linkedin, Download, Eye } from "lucide-react"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { useState } from "react"
import { LocationLink } from "../ui/LocationLink"
import { motion } from "framer-motion"

export default function Hero() {
    const [previewDoc, setPreviewDoc] = useState<{ title: string, url: string } | null>(null)

    return (
        <section id="about" className="w-full py-12 md:py-16 lg:py-24 bg-background">
            <div className="container max-w-5xl mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5 }}
                    className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden p-6 md:p-10"
                >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 border-b border-border/40 pb-8">

                        {/* Title & Contact info */}
                        <div className="flex-1 space-y-4 text-center md:text-left order-2 md:order-1">
                            <div className="space-y-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase">
                                    John Harold E. Selga
                                </h1>
                                <h2 className="text-lg md:text-xl font-medium text-primary">
                                    I.T • Web Developer • Infrastructure
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-sm text-foreground/80 mt-2">
                                <LocationLink
                                    location="Matadero, Cabanatuan City Nueva Ecija"
                                    iconClassName="h-4 w-4 text-muted-foreground mr-1"
                                />
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-muted-foreground mr-1.5" />
                                    <a href="mailto:johnselga18@gmail.com" className="hover:text-primary transition-colors">
                                        johnselga18@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-4 w-4 text-muted-foreground mr-1.5" />
                                    <span>0936-332-4878</span>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
                                <a href="https://www.facebook.com/BarumBadu18/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors">
                                    <Facebook className="h-5 w-5" />
                                    <span className="sr-only">Facebook</span>
                                </a>
                                <a href="https://github.com/HaroldSelga" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                    <Github className="h-5 w-5" />
                                    <span className="sr-only">GitHub</span>
                                </a>
                                <a href="https://www.linkedin.com/in/john-harold-selga-0133a2254/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                    <span className="sr-only">LinkedIn</span>
                                </a>
                            </div>

                            {/* Document Buttons */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                {/* Resume Group */}
                                <div className="flex items-center">
                                    <Button asChild variant="outline" size="sm" className="rounded-l-full rounded-r-none border-primary/20 hover:border-primary/50 text-xs">
                                        <a href="/documents/Resume.pdf" download="John_Harold_Selga_Resume.pdf">
                                            <Download className="mr-2 h-3.5 w-3.5" />
                                            Resume
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-r-full rounded-l-none border-l-0 border-primary/20 hover:border-primary/50 text-xs px-3"
                                        title="View Resume"
                                        onClick={() => setPreviewDoc({ title: "Resume Preview", url: "/documents/Resume.pdf" })}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                {/* PDS Group */}
                                <div className="flex items-center">
                                    <Button asChild variant="outline" size="sm" className="rounded-l-full rounded-r-none border-primary/20 hover:border-primary/50 text-xs">
                                        <a href="/documents/PDS 2026.pdf" download="John_Harold_Selga_PDS_2026.pdf">
                                            <Download className="mr-2 h-3.5 w-3.5" />
                                            PDS 2026
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-r-full rounded-l-none border-l-0 border-primary/20 hover:border-primary/50 text-xs px-3"
                                        title="View PDS"
                                        onClick={() => setPreviewDoc({ title: "PDS 2026 Preview", url: "/documents/PDS 2026.pdf" })}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="order-1 md:order-2 flex-shrink-0">
                            <div className="h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-2xl md:rounded-xl border border-border bg-muted flex items-center justify-center shadow-sm">
                                {/* Using a placeholder that user can easily replace. Pointing to public/profile.jpg by default if they add it */}
                                <img
                                    src="/profile.jpg"
                                    alt="John Harold E. Selga"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if no image is placed in public folder yet
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <User className="h-16 w-16 text-muted-foreground/30 hidden" />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        {/* Objective */}
                        <div className="md:col-span-2 space-y-3">
                            <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <div className="h-full w-1 bg-primary rounded-full py-2"></div>
                                Professional Objective
                            </h3>
                            <p className="text-foreground/90 leading-relaxed text-[15px] sm:text-base text-justify">
                                Entry-level software developer seeking a position where I can apply my programming skills, learn new technologies, and gain real-world development experience. I am eager to grow as a developer while contributing to building efficient and reliable software solutions.
                            </p>
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <div className="h-full w-1 bg-primary rounded-full py-2"></div>
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Birth Date</span>
                                    <span className="font-medium text-foreground/90">Mar 18, 2000</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Age</span>
                                    <span className="font-medium text-foreground/90">25</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Gender</span>
                                    <span className="font-medium text-foreground/90">Male</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Nationality</span>
                                    <span className="font-medium text-foreground/90">Filipino</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Civil Status</span>
                                    <span className="font-medium text-foreground/90">Single</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Religion</span>
                                    <span className="font-medium text-foreground/90">Catholic</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

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
                        className="w-full h-full border-none"
                        title={previewDoc.title}
                    />
                )}
            </Modal>
        </section>
    )
}

