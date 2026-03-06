import { Github, Linkedin, Mail, Facebook } from "lucide-react"

export function Footer() {
    return (
        <footer className="w-full border-t py-6 md:py-0 bg-background">
            <div className="container flex flex-col items-center justify-between gap-4 mx-auto px-4 md:h-24 md:flex-row md:px-6">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with modern web technologies. Focuses on minimal, aesthetic design.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <a
                        href="https://github.com/HaroldSelga"
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                    </a>
                    <a
                        href="https://www.facebook.com/BarumBadu18/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-[#1877F2] transition-colors"
                    >
                        <Facebook className="h-5 w-5" />
                        <span className="sr-only">Facebook</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/john-harold-selga-0133a2254/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
                    >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                    </a>
                    <a
                        href="mailto:johnselga18@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Mail className="h-5 w-5" />
                        <span className="sr-only">Email</span>
                    </a>
                </div>
            </div>
        </footer>
    )
}
