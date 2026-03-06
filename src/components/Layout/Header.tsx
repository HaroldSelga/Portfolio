import { FileText, Send } from "lucide-react"
import { Button } from "../ui/Button"
import { ThemeToggle } from "../ThemeToggle"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
                {/* Left: Logo */}
                <div className="flex w-1/3 justify-start">
                    <a className="flex items-center space-x-2 group" href="/">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="hidden font-bold sm:inline-block tracking-tight text-lg">
                            Portfolio
                        </span>
                    </a>
                </div>

                {/* Center: Nav Links */}
                <div className="hidden md:flex w-1/3 justify-center">
                    <nav className="flex items-center space-x-8 text-sm font-medium">
                        <a href="#about" className="transition-colors hover:text-primary text-foreground/70">
                            About
                        </a>
                        <a href="#experience" className="transition-colors hover:text-primary text-foreground/70">
                            Experience
                        </a>
                        <a href="#projects" className="transition-colors hover:text-primary text-foreground/70">
                            Projects
                        </a>
                        <a href="#skills" className="transition-colors hover:text-primary text-foreground/70">
                            Skills
                        </a>
                        <a href="#media" className="transition-colors hover:text-primary text-foreground/70">
                            Multimedia
                        </a>
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex w-1/3 justify-end items-center space-x-2">
                    <ThemeToggle />
                    <nav className="flex items-center">
                        <a href="#contact">
                            <Button className="font-semibold h-9 px-5 rounded-full shadow-sm transition-all hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
                                <Send className="mr-2 h-4 w-4" />
                                Contact Me
                            </Button>
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    )
}
