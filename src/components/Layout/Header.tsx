import { FileText, Send, Menu, X, ArrowLeft } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "../ui/Button"
import { ThemeToggle } from "../ThemeToggle"
import { useState, useEffect } from "react"
import { cn } from "../../lib/utils"
import { motion, useScroll, useSpring } from "framer-motion"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()
    const isWorkspace = location.pathname === "/workspace"
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    // Close menu when clicking on a link
    const closeMenu = () => setIsMenuOpen(false)

    // Close menu on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMenuOpen(false)
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [])
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left z-50"
                style={{ scaleX }}
            />
            <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
                {/* Left: Logo */}
                <div className="flex w-1/4 md:w-1/3 justify-start">
                    <Link className="flex items-center space-x-2 group" to="/">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-all duration-300">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="hidden font-bold tracking-tight text-lg group-hover:text-primary transition-colors sm:inline-block">
                            Portfolio
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Nav Links */}
                <div className="hidden md:flex w-1/3 justify-center">
                    <nav className="flex items-center space-x-8 text-sm font-medium">
                        {isWorkspace ? (
                            <Link to="/" className="transition-all hover:text-primary text-foreground/70 flex items-center gap-2 group">
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Home
                            </Link>
                        ) : (
                            <>
                                <a href="#about" className="transition-all hover:text-primary text-foreground/70 hover:scale-105">
                                    About
                                </a>
                                <a href="#experience" className="transition-all hover:text-primary text-foreground/70 hover:scale-105">
                                    Experience
                                </a>
                                <a href="#skills" className="transition-all hover:text-primary text-foreground/70 hover:scale-105">
                                    Skills
                                </a>
                                <a href="#projects" className="transition-all hover:text-primary text-foreground/70 hover:scale-105">
                                    Projects
                                </a>
                                <a href="#media" className="transition-all hover:text-primary text-foreground/70 hover:scale-105">
                                    Multimedia
                                </a>
                            </>
                        )}
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex w-3/4 md:w-1/3 justify-end items-center gap-2 sm:gap-4">
                    <div className="flex items-center bg-muted/30 rounded-full px-2 py-1 border border-border/40 hover:border-primary/30 transition-all duration-300 group">
                        <ThemeToggle />
                        <div className="w-[1px] h-4 bg-border/60 mx-1 hidden sm:block" />
                        <a href={isWorkspace ? "/#contact" : "#contact"} className="ml-1 hidden sm:block">
                            <Button size="sm" className="font-bold h-8 rounded-full shadow-sm transition-all hover:shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                                <Send className="h-3.5 w-3.5" />
                                <span>Contact Me</span>
                            </Button>
                        </a>
                        {/* Mobile Menu Trigger */}
                        <button
                            className="md:hidden ml-2 p-1 rounded-md hover:bg-muted transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-expanded={isMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={cn(
                "md:hidden absolute top-16 left-0 w-full bg-background border-b transition-all duration-300 overflow-hidden",
                isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <nav className="flex flex-col p-6 space-y-4 font-medium text-lg">
                    {isWorkspace ? (
                        <Link to="/" onClick={closeMenu} className="hover:text-primary transition-colors flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Return Home
                        </Link>
                    ) : (
                        <>
                            <a href="#about" onClick={closeMenu} className="hover:text-primary transition-colors">About</a>
                            <a href="#experience" onClick={closeMenu} className="hover:text-primary transition-colors">Experience</a>
                            <a href="#projects" onClick={closeMenu} className="hover:text-primary transition-colors">Projects</a>
                            <a href="#skills" onClick={closeMenu} className="hover:text-primary transition-colors">Skills</a>
                            <a href="#media" onClick={closeMenu} className="hover:text-primary transition-colors">Multimedia</a>
                        </>
                    )}
                    <a href={isWorkspace ? "/#contact" : "#contact"} onClick={closeMenu} className="flex items-center gap-2 text-primary font-bold pt-2">
                        <Send className="h-4 w-4" />
                        Contact Me
                    </a>
                </nav>
            </div>
        </header>
    )
}
