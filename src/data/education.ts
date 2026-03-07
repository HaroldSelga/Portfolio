import { GraduationCap, BookOpen, type LucideIcon } from "lucide-react"

export interface EducationItem {
    degree: string
    school: string
    location: string
    query: string
    period: string
    level: string
    icon: LucideIcon
}

export const educationData: EducationItem[] = [
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
