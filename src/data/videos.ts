export interface VideoItem {
    title: string
    id: string
    category: string
    description: string
}

export const videoData: VideoItem[] = [
    {
        title: "TRB System Demo 1",
        id: "vQVZKAIgeUQ",
        category: "PROFESSIONAL WORK",
        description: "Just a Simple Guide for our Admin user."
    },
    {
        title: "TRB System Demo 2",
        id: "zAoN6E6c6no",
        category: "PROFESSIONAL WORK",
        description: "Just a Simple Guide for our Admin user."
    },
    {
        title: "TRB System Demo 3",
        id: "jlxvA0AcvzU",
        category: "PROFESSIONAL WORK",
        description: "Just a Simple Guide for our Admin user."
    },
    {
        title: "TRB System Demo 4",
        id: "uYr1riTEZhQ",
        category: "PROFESSIONAL WORK",
        description: "Just a Simple Guide for our Admin user."
    },
    {
        title: "Old Capitol System Demo",
        id: "gcXusbcqGsU",
        category: "HOBBIES",
        description: "Automated DTR, attendance summary, and report generation system.\n\nKey features:\n• Municipality and district-level reporting for farmers\n• Automatic document generation (Certificates, Offer Sheets)\n• Demographic data analysis across Nueva Ecija"
    },
    {
        title: "For Fun",
        id: "9l1OJsgfy0s",
        category: "HOBBIES",
        description: "Custom tool for sorting voter data and generating analytical reports."
    },
    {
        title: "Kingsman Demo",
        id: "_IcAbmCnc6c",
        category: "HOBBIES",
        description: "School sideline project demonstrating efficient data management.\n\nHighlights:\n• Client-based practice project\n• Simple, efficient data organization interface\n• Task automation for easier user workflows"
    },
    {
        title: "College for Research and technology Portal",
        id: "rnRfD0PMHSo",
        category: "HOBBIES",
        description: "A personal portal simulation project for practice and experimentation.\n\nFocus areas:\n• Web system structure\n• Portal-style interfaces\n• Basic database and user interaction"
    },
    {
        title: "Recipe Book System",
        id: "n37qWqCt52U", // Placeholder ID
        category: "HOBBIES",
        description: "A comprehensive recipe management platform.\n\nKey features:\n• Full CRUD functionality for recipes\n• Interactive landing page for browsing\n• Recipe rating and feedback system\n• Admin dashboard for content management"
    },
]

export const videoFilters = ["ALL", "PROFESSIONAL WORK", "HOBBIES"]
