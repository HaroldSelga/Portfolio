import { socialLinks } from "../../data/social"

export function Footer() {
    return (
        <footer className="w-full border-t py-6 md:py-8 bg-background relative z-10">
            <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex flex-col items-center gap-2 md:items-start">
                    <p className="text-sm font-medium text-foreground/80">
                        © {new Date().getFullYear()} John Harold Selga.
                    </p>
                    <p className="text-xs text-muted-foreground transition-opacity hover:opacity-80">
                        Built with React 19, Vite, Tailwind & Framer Motion.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {socialLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg border border-border/50 transition-all duration-300 ${social.color} ${social.bgColor} hover:scale-110 shadow-sm`}
                            aria-label={social.name}
                        >
                            <social.icon className="h-4 w-4" />
                            <span className="sr-only">{social.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    )
}
