export interface CoverLetterData {
    name: string
    phone: string
    email: string
    portfolioUrl: string
    address: string
    template: string
}

export const coverLetterData: CoverLetterData = {
    name: "JOHN HAROLD E. SELGA",
    phone: "0936-3324-878",
    email: "johnselga18@gmail.com",
    portfolioUrl: "https://portfolio-rho-three-2vpgcjme17.vercel.app/",
    address: "Cabanatuan City, Nueva Ecija",
    template: `[Date]

[Hiring Manager's Name or "Hiring Team"]
[Company Name]
[Company Address or City]

Dear [Hiring Manager's Name or "Hiring Team"],

I am writing to express my strong interest in the [Insert Job Title, e.g., Full Stack Developer] position at [Insert Company Name]. With a strong foundation in modern web frameworks and a proven history of digitalizing complex business operations, I am confident I can bring immediate value to your engineering team.

Currently, as a Web Developer for the Municipality of Santa Rosa, I architected a comprehensive LGU Management System (IGIS) using Laravel, React, and PostgreSQL. This system successfully digitalized the workflows of over 15 municipal departments and included a public-facing React Native mobile portal.

Beyond government systems, my experience spans logistics and real-time applications. I previously developed core routing and tracking systems for TRB Express Inc., and I actively build robust MERN stack applications. My recent projects include Downtown Barbers (a multi-branch management dashboard with local payment integrations) and Online Weteng (a real-time platform utilizing Socket.io).

I don’t just write code; I understand the ground-level operations that the code needs to support. I have attached my resume and invite you to review my portfolio to see my code structure firsthand. I would welcome the opportunity to discuss how I can contribute to the goals of [Insert Company Name].

Thank you for your time and consideration.

Sincerely,

John Harold E. Selga`
}
