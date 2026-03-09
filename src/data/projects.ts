export interface ProjectItem {
    title: string
    description: string
    image: string
    images?: string[]
    tags: string[]
    liveUrl: string
    githubUrl: string
    accent: string
}

export const projects: ProjectItem[] = [
    {
        title: "IGIS - Municipality Portal",
        description: "Integrated Government Information System for Santa Rosa, Nueva Ecija. Features a comprehensive Citizen Self-Service portal for online document requests (Barangay Clearance, Indigency), a Sectoral ID System (Senior, PWD, Solo Parent), and real-time administrative dashboards for municipal officials.",
        image: "/projects/igis/bims.png",
        images: [
            "/projects/igis/bims.png",
            "/projects/igis/map.png",
            "/projects/igis/gso.png",
            "/projects/igis/igis-dashboard.png",
            "/projects/igis/igis-portal.png"
        ],
        tags: ["Laravel", "React", "PostgreSQL", "TailwindCSS", "Framer Motion"],
        liveUrl: "https://app.simsportal.xyz/",
        githubUrl: "#",
        accent: "from-blue-500 to-cyan-400",
    },
    {
        title: "Online Weteng",
        description: "A digital betting platform for Weteng in the Philippines. Features real-time draw management, betting POS, and automated payout calculations. Developed in collaboration with Jasper Dale Manahan.",
        image: "/projects/weteng/dashboard.png",
        images: [
            "/projects/weteng/dashboard.png",
            "/projects/weteng/pos.png",
            "/projects/weteng/logs.png",
            "/projects/weteng/settings.png",
            "/projects/weteng/receipt.png"
        ],
        tags: ["React", "Node.js", "MongoDB", "TailwindCSS", "Socket.io", "Express"],
        liveUrl: "#",
        githubUrl: "#",
        accent: "from-yellow-500 to-orange-400",
    },
    {
        title: "Dropdown Barbers",
        description: "A comprehensive barbershop management system. Features include stylized booking wizards, user loyalty programs, referral systems, and a full administrative dashboard for network-wide oversight.",
        image: "/projects/dropdown/schedule.png",
        images: [
            "/projects/dropdown/booking.png",
            "/projects/dropdown/shop.png",
            "/projects/dropdown/loyalty.png",
            "/projects/dropdown/admin-dashboard.png",
            "/projects/dropdown/schedule.png"
        ],
        tags: ["React", "Node.js", "MongoDB", "TailwindCSS", "Express", "Lucide React", "Framer Motion"],
        liveUrl: "#",
        githubUrl: "#",
        accent: "from-red-600 to-red-400",
    },
    {
        title: "TRB EXPRESS Inc. Logistics System",
        description: "A full-scale logistics and courier management platform for TRB Express Inc. Features automated parcel tracking, branch administration, and real-time delivery status updates.",
        image: "/projects/trb/trb-express.png",
        images: [
            "/projects/trb/trb-express.png",
            "/projects/trb/trb-login.png"
        ],
        tags: ["Laravel PHP", "Flutter", "MySQL", "REST API", "C-Panel"],
        liveUrl: "https://login.idelivertrb.com/",
        githubUrl: "#",
        accent: "from-orange-500 to-amber-400",
    },
]
