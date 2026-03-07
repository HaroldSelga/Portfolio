export interface Skill {
    name: string
    icon: string
    category: string
    subCategory: string
}

export const allSkills: Skill[] = [
    // Languages & Core Technologies
    { name: "PHP", icon: "https://skillicons.dev/icons?i=php", category: "Languages", subCategory: "Primary Languages" },
    { name: "JavaScript", icon: "https://skillicons.dev/icons?i=js", category: "Languages", subCategory: "Primary Languages" },
    { name: "TypeScript", icon: "https://skillicons.dev/icons?i=ts", category: "Languages", subCategory: "Primary Languages" },
    { name: "Python", icon: "https://skillicons.dev/icons?i=py", category: "Languages", subCategory: "Secondary Languages" },
    { name: "C#", icon: "https://skillicons.dev/icons?i=cs", category: "Languages", subCategory: "Secondary Languages" },
    { name: "C++", icon: "https://skillicons.dev/icons?i=cpp", category: "Languages", subCategory: "Secondary Languages" },
    { name: "Java", icon: "https://skillicons.dev/icons?i=java", category: "Languages", subCategory: "Secondary Languages" },
    { name: "HTML5", icon: "https://skillicons.dev/icons?i=html", category: "Languages", subCategory: "Core Web Technologies" },
    { name: "CSS3", icon: "https://skillicons.dev/icons?i=css", category: "Languages", subCategory: "Core Web Technologies" },

    // Frontend Frameworks & Libraries
    { name: "React", icon: "https://skillicons.dev/icons?i=react", category: "Frontend", subCategory: "Core Frameworks" },
    { name: "Tailwind CSS", icon: "https://skillicons.dev/icons?i=tailwind", category: "Frontend", subCategory: "Styling" },
    { name: "Bootstrap", icon: "https://skillicons.dev/icons?i=bootstrap", category: "Frontend", subCategory: "Styling" },
    { name: "Axios", icon: "https://cdn.simpleicons.org/axios", category: "Frontend", subCategory: "Data Fetching" },

    // Mobile Development
    { name: "React Native (Expo)", icon: "https://cdn.simpleicons.org/expo", category: "Mobile", subCategory: "Frameworks/SDKs" },
    { name: "Flutter", icon: "https://skillicons.dev/icons?i=flutter", category: "Mobile", subCategory: "Frameworks/SDKs" },

    // Backend & Server-Side
    { name: "Laravel", icon: "https://skillicons.dev/icons?i=laravel", category: "Backend", subCategory: "Frameworks" },
    { name: "Express", icon: "https://skillicons.dev/icons?i=express", category: "Backend", subCategory: "Frameworks" },
    { name: "Node.js", icon: "https://skillicons.dev/icons?i=nodejs", category: "Backend", subCategory: "Runtime Environments" },
    { name: "REST APIs", icon: "https://skillicons.dev/icons?i=php", category: "Backend", subCategory: "APIs & Data Formats" },
    { name: "JSON", icon: "https://cdn.simpleicons.org/json", category: "Backend", subCategory: "APIs & Data Formats" },
    { name: "WordPress", icon: "https://skillicons.dev/icons?i=wordpress", category: "Backend", subCategory: "CMS" },

    // Database Management Systems
    { name: "MySQL", icon: "https://skillicons.dev/icons?i=mysql", category: "Databases", subCategory: "Relational (SQL)" },
    { name: "PostgreSQL", icon: "https://skillicons.dev/icons?i=postgres", category: "Databases", subCategory: "Relational (SQL)" },
    { name: "MariaDB", icon: "https://cdn.simpleicons.org/mariadb", category: "Databases", subCategory: "Relational (SQL)" },
    { name: "MongoDB", icon: "https://skillicons.dev/icons?i=mongodb", category: "Databases", subCategory: "NoSQL" },
    { name: "Firebase Firestore", icon: "https://skillicons.dev/icons?i=firebase", category: "Databases", subCategory: "NoSQL" },

    // Infrastructure & DevOps
    { name: "Ubuntu Linux", icon: "https://skillicons.dev/icons?i=ubuntu", category: "DevOps", subCategory: "Operating Systems" },
    { name: "Docker", icon: "https://skillicons.dev/icons?i=docker", category: "DevOps", subCategory: "Containerization" },
    { name: "Docker Compose", icon: "https://raw.githubusercontent.com/docker/compose/master/logo.png", category: "DevOps", subCategory: "Containerization" },
    { name: "Coolify", icon: "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/coolify.png", category: "DevOps", subCategory: "Deployment & Hosting" },
    { name: "cPanel", icon: "https://cdn.simpleicons.org/cpanel", category: "DevOps", subCategory: "Deployment & Hosting" },
    { name: "Vercel", icon: "https://skillicons.dev/icons?i=vercel", category: "DevOps", subCategory: "Deployment & Hosting" },
    { name: "Cloudflare", icon: "https://skillicons.dev/icons?i=cloudflare", category: "DevOps", subCategory: "Cloud & Networking" },
    { name: "GoDaddy", icon: "https://cdn.simpleicons.org/godaddy", category: "DevOps", subCategory: "Cloud & Networking" },
    { name: "Apache", icon: "https://cdn.simpleicons.org/apache", category: "DevOps", subCategory: "Web Servers" },
    { name: "Nginx", icon: "https://skillicons.dev/icons?i=nginx", category: "DevOps", subCategory: "Web Servers" },

    // Development Tools & Version Control
    { name: "Git", icon: "https://skillicons.dev/icons?i=git", category: "Tools", subCategory: "Version Control" },
    { name: "GitHub", icon: "https://skillicons.dev/icons?i=github", category: "Tools", subCategory: "Version Control" },
    { name: "VS Code", icon: "https://skillicons.dev/icons?i=vscode", category: "Tools", subCategory: "Editors & AI Tools" },
    { name: "Visual Studio", icon: "https://skillicons.dev/icons?i=visualstudio", category: "Tools", subCategory: "Editors & AI Tools" },
    { name: "Eclipse", icon: "https://skillicons.dev/icons?i=eclipse", category: "Tools", subCategory: "Editors & AI Tools" },
    { name: "Cursor", icon: "https://cdn.simpleicons.org/cursor", category: "Tools", subCategory: "Editors & AI Tools" },
    { name: "Claude Code", icon: "https://cdn.simpleicons.org/anthropic", category: "Tools", subCategory: "Editors & AI Tools" },
    { name: "Anti Gravity", icon: "https://www.vectorlogo.zone/logos/google/google-icon.svg", category: "Tools", subCategory: "Editors & AI Tools" },
    { name: "Postman", icon: "https://skillicons.dev/icons?i=postman", category: "Tools", subCategory: "API Testing" },
    { name: "XAMPP", icon: "https://cdn.simpleicons.org/xampp", category: "Tools", subCategory: "Local Servers" },

    // Design & Multimedia
    { name: "Figma", icon: "https://skillicons.dev/icons?i=figma", category: "Design", subCategory: "UI/UX" },
    { name: "Adobe Photoshop", icon: "https://skillicons.dev/icons?i=ps", category: "Design", subCategory: "Graphics" },
    { name: "Wondershare Filmora", icon: "https://cdn.simpleicons.org/wondersharefilmora", category: "Design", subCategory: "Video Editing" },
    { name: "Adobe Premiere Pro", icon: "https://skillicons.dev/icons?i=pr", category: "Design", subCategory: "Video Editing" },
    { name: "CapCut", icon: "https://cdn.jsdelivr.net/gh/callback-io/allogo@main/public/logos/capcut/icon.svg", category: "Design", subCategory: "Video Editing" },
]

export const categoryTitles: Record<string, string> = {
    "Languages": "Languages & Core Technologies",
    "Frontend": "Frontend Frameworks & Libraries",
    "Mobile": "Mobile Development",
    "Backend": "Backend & Server-Side",
    "Databases": "Database Management Systems",
    "DevOps": "Infrastructure & DevOps",
    "Tools": "Development Tools & Version Control",
    "Design": "Design & Multimedia"
}

export const filters = ["All", "Languages", "Frontend", "Mobile", "Backend", "Databases", "DevOps", "Tools", "Design"]
