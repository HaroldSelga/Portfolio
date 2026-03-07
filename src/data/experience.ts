export interface ExperienceItem {
    role: string
    company: string
    location: string
    locationUrl: string
    duration: string
    tag: string
    description: string[]
}

export const experiences: ExperienceItem[] = [
    {
        role: "Web Developer",
        company: "MUNICIPALITY OF SANTA ROSA",
        location: "Santa Rosa, Nueva Ecija",
        locationUrl: "https://maps.google.com/?q=Santa+Rosa+Municipal+Hall+Nueva+Ecija",
        duration: "January 05, 2026 - PRESENT",
        tag: "WORK EXPERIENCE",
        description: [
            "Responsible for the maintenance and development of municipal web applications and digital assets.",
            "Ensuring web infrastructure uptime and optimizing performance for public-facing services.",
            "Collaborating with department heads to digitize administrative workflows and public information systems."
        ],
    },
    {
        role: "FIELD ASSESSMENT AIDE II",
        company: "PROVINCIAL ASSESSOR'S OFFICE",
        location: "Old Capitol, Burgos Ave, Cabanatuan City, Nueva Ecija",
        locationUrl: "https://maps.google.com/?q=Old+Capitol,+Burgos+Ave,+Cabanatuan+City,+Nueva+Ecija",
        duration: "March 01, 2024 - January 01, 2026",
        tag: "WORK EXPERIENCE",
        description: [
            "Responsible for assisting in field assessments and data verification for real property appraisal.",
            "Conducted site inspections and data collection to update property tax records and assessments.",
            "Maintained and updated geographic and descriptive data for property inventory.",
            "Coordinated with local assessor units for streamlined provincial property mapping."
        ],
    },
    {
        role: "I.T SUPERVISOR JR / WEB DEVELOPER",
        company: "TRB EXPRESS INC.",
        location: "Arems Place, Binmaley, Pangasinan, Philippines",
        locationUrl: "https://maps.google.com/?q=Buenlag,+Binmaley,+Pangasinan",
        duration: "October 01, 2022 – November 08, 2023",
        tag: "WORK EXPERIENCE",
        description: [
            "Responsible for the development and improvement of current logistics system, using Laravel PHP, Flutter, Postman.",
            "Responsible for the training of branch administrator on how to use the system using zoom and going to their branch.",
            "Responsible for overseeing the database model and managing the MySQL database."
        ],
    },
    {
        role: "OJT",
        company: "GOODSAM MEDICAL CENTER",
        location: "Cabanatuan City, Nueva Ecija",
        locationUrl: "https://maps.google.com/?q=GOODSAM+MEDICAL+CENTER+Cabanatuan+City,+Nueva+Ecija",
        duration: "240 Hours 2019-2020",
        tag: "OJT",
        description: [
            "Responsible for addressing technical issues, including printer troubleshooting, stage setup, and deep cleaning of computers.",
            "Responsible for inputting provided data from the admin/cashier into the database using SQL."
        ],
    },
    {
        role: "OJT",
        company: "COMELEC CABANATUAN",
        location: "Cabanatuan City, Nueva Ecija",
        locationUrl: "https://maps.google.com/?q=COMELEC+Cabanatuan+City,+Nueva+Ecija",
        duration: "240 Hours 2020-2021",
        tag: "OJT",
        description: [
            "Responsible for preparing the machine for voting and setup.",
            "Data Encode."
        ],
    },
    {
        role: "WORK IMMERSION",
        company: "BISTRO 1996",
        location: "Cabanatuan City, Nueva Ecija",
        locationUrl: "https://maps.google.com/?q=Bistro+1996+Cabanatuan+City,+Nueva+Ecija",
        duration: "80 Hours 2017-2018",
        tag: "WORK IMMERSION",
        description: [
            "Responsible for utilizing Photoshop to design and create banners, invitation cards, and other graphical materials."
        ],
    }
]
