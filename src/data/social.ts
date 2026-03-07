import { Github, Linkedin, Mail, Facebook, type LucideIcon } from "lucide-react"

export interface SocialLink {
    name: string
    url: string
    icon: LucideIcon
    color: string
    bgColor: string
}

export const socialLinks: SocialLink[] = [
    {
        name: "GitHub",
        url: "https://github.com/HaroldSelga",
        icon: Github,
        color: "hover:text-foreground",
        bgColor: "hover:bg-foreground/5"
    },
    {
        name: "Facebook",
        url: "https://www.facebook.com/BarumBadu18/",
        icon: Facebook,
        color: "hover:text-[#1877F2]",
        bgColor: "hover:bg-[#1877F2]/10"
    },
    {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/john-harold-selga-0133a2254/",
        icon: Linkedin,
        color: "hover:text-[#0A66C2]",
        bgColor: "hover:bg-[#0A66C2]/10"
    },
    {
        name: "Email",
        url: "mailto:johnselga18@gmail.com",
        icon: Mail,
        color: "hover:text-primary",
        bgColor: "hover:bg-primary/10"
    }
]
