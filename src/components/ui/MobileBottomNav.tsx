import { useState, useEffect } from "react"
import { ArrowUp, User, Briefcase, Code2, FolderKanban, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
    { label: "About", href: "#about", icon: User },
    { label: "Experience", href: "#experience", icon: Briefcase },
    { label: "Skills", href: "#skills", icon: Code2 },
    { label: "Projects", href: "#projects", icon: FolderKanban },
    { label: "Media", href: "#media", icon: Play },
]

export function MobileBottomNav() {
    const [isVisible, setIsVisible] = useState(false)
    const [activeSection, setActiveSection] = useState("")

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300)

            // Determine active section based on scroll position
            const sections = navItems.map(item => item.href.replace("#", ""))
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i])
                if (el && el.getBoundingClientRect().top <= 150) {
                    setActiveSection(sections[i])
                    break
                }
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
                >
                    <div className="mx-3 mb-3 px-2 py-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl flex items-center justify-around gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSection === item.href.replace("#", "")
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${isActive
                                            ? "text-primary bg-primary/10 scale-105"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </a>
                            )
                        })}
                        <button
                            onClick={scrollToTop}
                            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary/90 transition-all active:scale-95 shadow-md"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="h-4 w-4" />
                            <span>Top</span>
                        </button>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    )
}
