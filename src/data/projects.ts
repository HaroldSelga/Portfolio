export interface ProjectTab {
    label: string
    description: string
    images: string[]
    features: string[]
}

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
    tabs?: ProjectTab[]
}

export const projects: ProjectItem[] = [
    {
        title: "AAL Milktea Supplies ERP",
        description: "A full-scale enterprise resource planning platform consolidating HR, payroll, sales, POS, inventory, manufacturing, logistics, finance, and customer operations for a milktea supplies business.",
        image: "/projects/aalmilktea/landing.png",
        tags: ["Laravel 12", "React 19", "TypeScript", "PostgreSQL", "Tailwind CSS 4", "Inertia.js", "Laravel Reverb", "Radix UI"],
        liveUrl: "https://milktea.testwebsitonline.xyz/",
        githubUrl: "#",
        accent: "from-amber-500 to-yellow-400",
        tabs: [
            {
                label: "Overview",
                description: "A multi-portal ERP platform centralizing business processes for administrators, employees, cashiers, and B2B customers.",
                images: ["/projects/aalmilktea/landing.png"],
                features: [
                    "Architected a unified ERP system with role-based access control, serving owners, staff, cashiers, and customers.",
                    "Integrates real-time notifications and an interactive system-wide AI chat agent for workflow assistance.",
                    "Secured with robust logging and audit trails to track financial transactions and user actions."
                ]
            },
            {
                label: "POS Terminal",
                description: "A robust cashier Point of Sale interface designed for high-performance retail operations.",
                images: ["/projects/aalmilktea/pos.png"],
                features: [
                    "Features barcode-driven checkout and barcode scanning with instant inventory lookup.",
                    "Session management with opening and closing cash denomination counts.",
                    "Provides secure Z-reading reports and manager-override approval gates for processing custom discounts."
                ]
            },
            {
                label: "HR & Payroll",
                description: "A complete workforce module automates attendance, scheduling, and Philippine government deductions.",
                images: [
                    "/projects/aalmilktea/hr-dashboard.png",
                    "/projects/aalmilktea/payroll.png",
                    "/projects/aalmilktea/employee-dashboard.png"
                ],
                features: [
                    "Includes face-recognition attendance checks with location validation.",
                    "Automated payroll computations incorporating SSS, PhilHealth, Pag-IBIG, and tax contributions.",
                    "Manages work shift schedules, overtime, and leave applications with multi-tier approval flows."
                ]
            },
            {
                label: "CRM & Portals",
                description: "Dedicated client environments featuring customized design studios and interactive data tools.",
                images: [
                    "/projects/aalmilktea/crm.png",
                    "/projects/aalmilktea/customer-dashboard.png",
                    "/projects/aalmilktea/cup-studio.png",
                    "/projects/aalmilktea/design-request.png"
                ],
                features: [
                    "Interactive custom cup design studio allows clients to preview and request branded milktea cup mockups.",
                    "Customer dashboard tracks orders, handles support tickets, and displays invoices.",
                    "Heatmap analytics identify geographical areas with high customer concentration."
                ]
            },
            {
                label: "Procurement & Logistics",
                description: "Automated pipelines coordinate stock replenishment and B2B orders.",
                images: [
                    "/projects/aalmilktea/procurement.png",
                    "/projects/aalmilktea/heatmap.png"
                ],
                features: [
                    "Integrates the Lalamove API for calculating logistics routing and shipping fees.",
                    "Synchronizes listing stocks with external online stores (TikTok Shop, Shopee, Lazada).",
                    "Supports bulk purchasing orders with automated re-ordering thresholds."
                ]
            },
            {
                label: "Finance & Accounting",
                description: "Double-entry bookkeeping tools monitor profitability and cash flows.",
                images: [
                    "/projects/aalmilktea/finance.png",
                    "/projects/aalmilktea/accounting.png",
                    "/projects/aalmilktea/analytics.png"
                ],
                features: [
                    "Includes interactive general accounting ledgers and generates balance sheets automatically.",
                    "Analyzes margins and tracks store profitability across branch operations.",
                    "Integrates with the PayMongo gateway to process digital credit card, GCash, and Maya transactions."
                ]
            }
        ]
    },
    {
        title: "IGIS - Municipality Portal",
        description: "Integrated Government Information System for Santa Rosa, Nueva Ecija. A complete LGU Management System to digitalize the manual workflows of over 15 municipal departments.",
        image: "/projects/igis/bims.png",
        tags: ["Laravel", "React", "PostgreSQL", "TailwindCSS", "Framer Motion"],
        liveUrl: "https://app.simsportal.xyz/",
        githubUrl: "#",
        accent: "from-blue-500 to-cyan-400",
        tabs: [
            {
                label: "Overview",
                description: "A comprehensive digital infrastructure connecting various offices in Santa Rosa LGU.",
                images: ["/projects/igis/igis-dashboard.png"],
                features: [
                    "Centralizes data streams from over 15 government departments, reducing cross-department processing delays.",
                    "Real-time analytics monitor budget statuses, tax collections, and active permit applications.",
                    "Equipped with secure access levels for municipal administrators, officers, and department heads."
                ]
            },
            {
                label: "Citizen Portal",
                description: "A citizen-facing system that lets residents request and monitor government services.",
                images: ["/projects/igis/igis-portal.png"],
                features: [
                    "Features a Universal ID System linking citizens to their records and active applications.",
                    "Enables online applications for business permits, barangay clearances, and civil certificates.",
                    "Includes an incident reporting module to flag infrastructure hazards or request emergency assistance."
                ]
            },
            {
                label: "Departments",
                description: "Specialized sub-systems built to handle the workflows of distinct LGU offices.",
                images: [
                    "/projects/igis/bims.png",
                    "/projects/igis/map.png",
                    "/projects/igis/gso.png"
                ],
                features: [
                    "Includes HRIS/Payroll tools supporting government item classifications and attendance checking.",
                    "Zoning and real property tax assessment tools mapping land values and assessments.",
                    "GSO asset manager tracks municipal inventory, vehicles, and equipment deployments."
                ]
            }
        ]
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
