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
            "Developed a complete LGU Management System (IGIS) using Laravel, React, and PostgreSQL to digitalize the manual workflows of over 15 municipal departments.",
            "Engineered comprehensive internal platforms, including an automated HRIS/Payroll system and a financial tracking module for municipal budgets, taxes, and procurement.",
            "Built a Citizen Portal and a React Native mobile app equipped with a Universal ID System, enabling residents to access online services, report incidents, and track permits easily."
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
            "Gathered and managed field data by conducting surveys across various barangays to evaluate the success and impact of provincial youth programs.",
            "Handled inventory data tracking for relief goods, outreach supplies, and distributed items to ensure accurate records during provincial operations.",
            "Coordinated directly with stakeholders, including local SK (Sangguniang Kabataan) leaders and LGU officials, to organize and execute youth activities smoothly."
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
            "Developed and improved the core logistics and courier system using Laravel and Flutter, adding features for parcel tracking, waybill generation, and delivery dispatch.",
            "Managed the MySQL database to securely store thousands of daily transaction records, customer details, and real-time package statuses.",
            "Tested and maintained system APIs using Postman to ensure smooth communication between the web dashboard and the mobile delivery app.",
            "Trained branch administrators through Zoom and on-site visits, teaching them how to effectively use the system for their daily branch operations and package receiving."
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
            "Provided primary technical support across hospital departments, handling hardware troubleshooting, printer maintenance, and regular computer diagnostics.",
            "Managed data entry and database records, utilizing SQL to accurately input and update administrative and cashier data into the hospital's system.",
            "Assisted in IT and audiovisual setups for hospital events and presentations, ensuring smooth technical operations."
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
            "Configured and deployed automated voting machines, handling the strict technical setup and hardware preparation to ensure all systems were fully operational for election use."
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
            "Designed digital and print marketing materials using Adobe Photoshop, including promotional banners and custom invitation cards for restaurant events.",
            "Supported local business branding by creating visually appealing graphical assets to enhance customer engagement."
        ],
    }
]
