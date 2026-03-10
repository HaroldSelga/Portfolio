export interface ProjectItem {
    title: string
    description: string
    features?: string[]
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
        description: "Integrated Government Information System for Santa Rosa, Nueva Ecija. A complete LGU Management System to digitalize the manual workflows of over 15 municipal departments.",
        features: [
            "Developed a complete LGU Management System (IGIS) using Laravel, React, and PostgreSQL to digitalize the manual workflows of over 15 municipal departments.",
            "Engineered comprehensive internal platforms, including an automated HRIS/Payroll system and a financial tracking module for municipal budgets, taxes, and procurement.",
            "Built a Citizen Portal and a React Native mobile app equipped with a Universal ID System, enabling residents to access online services, report incidents, and track permits easily."
        ],
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
        description: "A digital betting platform for Weteng in the Philippines. Features real-time draw management, betting POS, and automated payout calculations.",
        features: [
            "Co-developed a real-time digital betting platform tailored for local operations, utilizing Socket.io for fast, live data updates.",
            "Programmed a secure Betting POS (Point of Sale) to handle daily collections, track active draws, and monitor real-time user balances.",
            "Automated complex payout calculations and draw management, significantly reducing manual errors during morning, noon, and afternoon operations."
        ],
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
        description: "A comprehensive barbershop management system. Features include stylized booking wizards, user loyalty programs, referral systems, and a full administrative dashboard.",
        features: [
            "Built the complete Downtown Barbers management system, featuring a multi-branch administrative dashboard and a custom booking wizard to handle barber schedules and shop capacity.",
            "Integrated local payment gateways (GCash and Maya) to seamlessly and securely process customer transactions.",
            "Developed automated customer retention features, including user loyalty and referral programs, to drive business growth and repeat bookings."
        ],
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
        features: [
            "Developed and improved the core logistics and courier system using Laravel and Flutter, adding features for parcel tracking, waybill generation, and delivery dispatch.",
            "Managed the MySQL database to securely store thousands of daily transaction records, customer details, and real-time package statuses.",
            "Tested and maintained system APIs using Postman to ensure smooth communication between the web dashboard and the mobile delivery app.",
            "Trained branch administrators through Zoom and on-site visits, teaching them how to effectively use the system for their daily branch operations and package receiving."
        ],
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
    {
        title: "MedPharm Pharmacy System",
        description: "A comprehensive point-of-sale, inventory, and management system specifically tailored for Philippine pharmacies. Features multi-branch operations, specialized discounts, offline POS capabilities, and rigorous batch tracking.",
        features: [
            "Built a Multi-Branch Operations system supporting seamless branch switching, isolated inventory data, and real-time syncing via Supabase.",
            "Developed an offline-first Point of Sale (POS) using Dexie.js for queued local transactions, equipped with global barcode scanning and unit conversions.",
            "Integrated Philippine regulatory calculations for Regular, Senior Citizen (SC), and PWD discounts to automatically compute taxes and totals.",
            "Engineered a robust Inventory and Purchase Order system with rigorous FEFO batch tracking, expiry alerts, and supplier coordination."
        ],
        image: "/projects/medpharm/dashboard.png",
        images: [
            "/projects/medpharm/login.png",
            "/projects/medpharm/loading.png",
            "/projects/medpharm/dashboard.png",
            "/projects/medpharm/inventory.png",
            "/projects/medpharm/pos.png",
            "/projects/medpharm/orders.png",
            "/projects/medpharm/sales.png",
            "/projects/medpharm/settings-branch.png"
        ],
        tags: ["React 19", "Vite", "Tailwind CSS", "Zustand", "Supabase", "Dexie.js"],
        liveUrl: "#",
        githubUrl: "#",
        accent: "from-green-500 to-emerald-400",
    },
]
