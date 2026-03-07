export interface ProjectItem {
    title: string
    description: string
    image: string
    tags: string[]
    liveUrl: string
    githubUrl: string
    accent: string
}

export const projects: ProjectItem[] = [
    {
        title: "IGIS - Municipality Portal",
        description: "Integrated Government Information System for Santa Rosa, Nueva Ecija. A comprehensive digital portal for municipal services, official announcements, and administrative dashboards.",
        image: "/projects/igis-portal.png",
        tags: ["Laravel", "React", "PostgreSQL", "TailwindCSS", "Cloudflare"],
        liveUrl: "https://app.simsportal.xyz/",
        githubUrl: "#",
        accent: "from-blue-500 to-cyan-400",
    },
    {
        title: "TRB EXPRESS Inc. Logistics System",
        description: "A full-scale logistics and courier management platform for TRB Express Inc. Features automated parcel tracking, branch administration, and real-time delivery status updates.",
        image: "/projects/trb-express.png",
        tags: ["Laravel PHP", "Flutter", "MySQL", "REST API", "C-Panel"],
        liveUrl: "https://login.idelivertrb.com/",
        githubUrl: "#",
        accent: "from-orange-500 to-amber-400",
    },
]
