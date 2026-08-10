// ── Shared Types for Requirements ───────────────────────────────────────

export interface ReqDocument {
    id?: number
    person_id: string
    name: string
    path: string
    category: "IDs & Clearances" | "Birth & Baptism" | "School & Credentials" | "Employment & Contributions" | "Photos"
    type: "pdf" | "jpg" | "xlsx" | "docx" | "html" | "png"
    size: string
    sort_order?: number
    issued_date?: string
    expiration_date?: string
}

export interface ChecklistItem {
    id?: number
    person_id: string
    title: string
    status: "claimed" | "printing" | "completed" | "error" | "info"
    status_text: string
    sort_order?: number
}

export interface ValidID {
    id?: number
    person_id: string
    name: string
    printed: boolean
    id_number: string
    issued_date: string
    expiration: string
    date_created: string
    user_id: string
    password: string
    remarks: string
    front_link: string
    back_link: string
    sort_order?: number
}

export interface Certificate {
    id?: number
    person_id: string
    name: string
    printed: boolean
    id_number: string
    issued_date: string
    expiration: string
    date_created: string
    user_id: string
    password: string
    remarks: string
    link: string
    sort_order?: number
}

export interface FamilyMember {
    id: string
    name: string
    relationship: string
    birthday: string
    contact: string
    linked_to?: string  // ID of partner/spouse for couple grouping
    favorite_food?: string
    clothing_size?: string
    hobbies?: string
    wishlist?: string
    notes?: string
}

export interface PersonOption {
    id: string
    label: string
    relationship?: string
}

// Document categories for the filter
export const DOC_CATEGORIES = [
    "IDs & Clearances",
    "Birth & Baptism",
    "School & Credentials",
    "Employment & Contributions",
    "Photos",
] as const

// Checklist status options
export const CHECKLIST_STATUSES = [
    { value: "completed", label: "Completed" },
    { value: "claimed", label: "To Claim" },
    { value: "printing", label: "To Print" },
    { value: "error", label: "Action Required" },
    { value: "info", label: "Info / Confirmed" },
] as const

// Relationship options for Family tab
export const RELATIONSHIPS = [
    "Self",
    "Mother",
    "Father",
    "Sister",
    "Brother",
    "Daughter",
    "Son",
    "Child",
    "Wife",
    "Husband",
    "Girlfriend",
    "Boyfriend",
    "Partner",
    "Fiancé",
    "Fiancée",
    "Grandmother",
    "Grandfather",
    "Aunt",
    "Uncle",
    "Cousin",
    "Niece",
    "Nephew",
    "Mother-in-law",
    "Father-in-law",
    "Sister-in-law",
    "Brother-in-law",
    "Godmother",
    "Godfather",
    "Friend",
    "Other"
] as const

// ── Default Data (localStorage fallback) ────────────────────────────────

export const defaultDocuments: Omit<ReqDocument, "person_id">[] = [
    { name: "Passport", path: "/documents/requirements/PASSPORT.pdf", category: "IDs & Clearances", type: "pdf", size: "1.01 MB" },
    { name: "Voter's Certificate", path: "/documents/requirements/Voters Certficate.jpg", category: "IDs & Clearances", type: "jpg", size: "5.24 MB" },
    { name: "Barangay Clearance", path: "/documents/requirements/need to print/Barangay Clearance.jpg", category: "IDs & Clearances", type: "jpg", size: "4.94 MB" },
    { name: "NBI Clearance", path: "/documents/requirements/NBI.jpg", category: "IDs & Clearances", type: "jpg", size: "10.43 MB" },
    { name: "Vaccine Certificate", path: "/documents/requirements/VAC CERT.pdf", category: "IDs & Clearances", type: "pdf", size: "849 KB" },
    { name: "PEOS Certificate", path: "/documents/requirements/PEOS CERTFICATE.pdf", category: "IDs & Clearances", type: "pdf", size: "61.3 KB" },
    { name: "Personal Data Sheet (PDS 2025)", path: "/documents/requirements/JOHN-HAROLD-E.-SELGA-PDS 2025.xlsx", category: "IDs & Clearances", type: "xlsx", size: "85.8 KB" },
    { name: "Certificate of Live Birth (LCR)", path: "/documents/requirements/PSA/CERTIFICATE OF LIVE BIRTH.pdf", category: "Birth & Baptism", type: "pdf", size: "1.95 MB" },
    { name: "Local Birth Certificate Form 102", path: "/documents/requirements/PSA/Form 102 _ Local Certficate.jpg", category: "Birth & Baptism", type: "jpg", size: "5.36 MB" },
    { name: "PSA Birth Certificate (Scanned)", path: "/documents/requirements/PSA/Scanned PSA.jpg", category: "Birth & Baptism", type: "jpg", size: "296 KB" },
    { name: "PSA Birth Certificate (New)", path: "/documents/requirements/PSA/NEW PSA.jpg", category: "Birth & Baptism", type: "jpg", size: "4.46 MB" },
    { name: "Certificate of Baptism", path: "/documents/requirements/CERTIFICATE OF BAPTISM.pdf", category: "Birth & Baptism", type: "pdf", size: "501 KB" },
    { name: "Diploma", path: "/documents/requirements/School Documents/DIPLOMA.pdf", category: "School & Credentials", type: "pdf", size: "1.11 MB" },
    { name: "Transcript of Records (TOR)", path: "/documents/requirements/School Documents/TOR.pdf", category: "School & Credentials", type: "pdf", size: "3.76 MB" },
    { name: "Transcript of Records (TOR Copy)", path: "/documents/requirements/School Documents/TOR (1).pdf", category: "School & Credentials", type: "pdf", size: "3.76 MB" },
    { name: "National Certificate II: Computer System Services", path: "/documents/requirements/Certificate/NATIONAL CERT - COMPUTER SYSTEMS SERVICING.pdf", category: "School & Credentials", type: "pdf", size: "1.62 MB" },
    { name: "National Certificate III: Events Management Services", path: "/documents/requirements/Certificate/NATIONAL CERT - EVENTS MANAGEMENT SERVICES.pdf", category: "School & Credentials", type: "pdf", size: "1.71 MB" },
    { name: "Taiwan Work Contract (3-Year Term)", path: "/documents/requirements/Taiwan_Work_Contract.pdf", category: "Employment & Contributions", type: "pdf", size: "1.85 MB", issued_date: "2026-08-12", expiration_date: "2029-08-12" },
    { name: "Certificate of Employment (Old Capitol)", path: "/documents/requirements/COE/COE OLD CAP.jpg", category: "Employment & Contributions", type: "jpg", size: "4.27 MB" },
    { name: "Certificate of Employment (TRB Express)", path: "/documents/requirements/COE/John Harold SELGA.docx.pdf", category: "Employment & Contributions", type: "pdf", size: "266 KB" },
    { name: "SSS Contribution Form", path: "/documents/requirements/need to print/SSS.docx", category: "Employment & Contributions", type: "docx", size: "159 KB" },
    { name: "ID List and Notes", path: "/documents/requirements/id.docx", category: "Employment & Contributions", type: "docx", size: "2.26 MB" },
    { name: "SSS/Philhealth Contribution List", path: "/documents/requirements/hulog.docx", category: "Employment & Contributions", type: "docx", size: "254 KB" },
    { name: "Resume (DOCX)", path: "/documents/requirements/need to print/resume final harold (1).docx", category: "Employment & Contributions", type: "docx", size: "40 KB" },
    { name: "Resume (PDF)", path: "/documents/requirements/need to print/resume final harold (1).pdf", category: "Employment & Contributions", type: "pdf", size: "113 KB" },
    { name: "E-Registration Printout (DOCX)", path: "/documents/requirements/need to print/PrintResume.aspx.docx", category: "Employment & Contributions", type: "docx", size: "19 KB" },
    { name: "E-Registration Printout (HTML)", path: "/documents/requirements/need to print/PrintResume.aspx.html", category: "Employment & Contributions", type: "html", size: "19 KB" },
    { name: "2x2 Photo (1)", path: "/documents/requirements/pic/2x2 (1)_095802.jpg", category: "Photos", type: "jpg", size: "134 KB" },
    { name: "2x2 Photo (2)", path: "/documents/requirements/pic/2x2 (2)_095755.jpg", category: "Photos", type: "jpg", size: "135 KB" },
    { name: "CSC Custom Size Photo", path: "/documents/requirements/pic/Csc_095800.jpg", category: "Photos", type: "jpg", size: "106 KB" },
    { name: "Passport Size Photo", path: "/documents/requirements/pic/Passport Size_095801.jpg", category: "Photos", type: "jpg", size: "104 KB" },
]

export const defaultChecklist: Omit<ChecklistItem, "person_id">[] = [
    { id: 1, title: "Voters Certificate", status: "claimed", status_text: "To claim / Kukunin na lang" },
    { id: 2, title: "Barangay Clearance", status: "claimed", status_text: "To claim / Kukunin na lang" },
    { id: 3, title: "NBI Clearance", status: "claimed", status_text: "To claim / Kukunin na lang" },
    { id: 4, title: "PSA Birth Certificate (QR Scan)", status: "error", status_text: "Barcode scans mismatch / QR not matching" },
    { id: 5, title: "Local Civil Registrar (LCR Form 1A & OR Form 102 with receipt)", status: "info", status_text: "Local certificate match confirmed" },
    { id: 7, title: "PEOS Certificate", status: "completed", status_text: "Completed / Meron na" },
    { id: 8, title: "E-Registration Certificate", status: "printing", status_text: "To print / Print na lang" },
    { id: 9, title: "E-Reg Details (All ID numbers & past experience list)", status: "completed", status_text: "Included & verified" },
    { id: 11, title: "National ID Card", status: "completed", status_text: "Printed / Printed na" },
    { id: 12, title: "TIN ID Card", status: "completed", status_text: "Printed / Printed na" },
    { id: 13, title: "Driver's License", status: "completed", status_text: "Printed / Printed na" },
    { id: 14, title: "Passport Book", status: "completed", status_text: "Printed / Printed na" },
    { id: 16, title: "Philhealth ID & Contribution History", status: "printing", status_text: "ID available, contribution ledger needs printing" },
    { id: 17, title: "Pag-IBIG ID & Contribution History", status: "printing", status_text: "ID available, contribution ledger needs printing" },
    { id: 18, title: "SSS ID & Contribution History", status: "printing", status_text: "Contribution ledger needs printing" },
    { id: 20, title: "College Transcript of Records (TOR)", status: "completed", status_text: "Printed / Printed na" },
    { id: 21, title: "College Diploma", status: "completed", status_text: "Printed / Printed na" },
    { id: 22, title: "NCII Computer System Services Certificate", status: "completed", status_text: "Printed / Printed na" },
    { id: 23, title: "NCIII Events Management Services Certificate", status: "completed", status_text: "Printed / Printed na" },
    { id: 25, title: "Updated Application Resume", status: "completed", status_text: "Printed / Printed na" },
    { id: 27, title: "TRB Certificate", status: "completed", status_text: "Printed & confirmed / Meron na" },
    { id: 28, title: "Old Capitol COE (Provincial Assessor's)", status: "claimed", status_text: "To claim / Kukunin pa lang" },
]

export const defaultValidIDs: Omit<ValidID, "person_id">[] = [
    { name: "Pag-IBIG RTN", printed: false, id_number: "922243382509", issued_date: "—", expiration: "—", date_created: "2023", user_id: "johnselga18@gmail.com", password: "AManword18@", remarks: "—", front_link: "", back_link: "" },
    { name: "Pag-IBIG MID No.", printed: false, id_number: "121306475308", issued_date: "—", expiration: "—", date_created: "2023", user_id: "johnselga18@gmail.com", password: "AManWord18@", remarks: "—", front_link: "", back_link: "" },
    { name: "SSS UMID", printed: false, id_number: "02-4734797-9", issued_date: "—", expiration: "—", date_created: "2023", user_id: "SAGIED18", password: "Selgaharold18@", remarks: "Number only", front_link: "", back_link: "" },
    { name: "PhilHealth", printed: true, id_number: "21-251027063-8", issued_date: "—", expiration: "—", date_created: "2023", user_id: "21-251027063-8", password: "AManWord18@", remarks: "—", front_link: "https://drive.google.com/file/d/1gfKvtFq0ewCwdgdF2C7wa3c7vqI3tJAf/view", back_link: "https://drive.google.com/file/d/1_LmHPlDhj6k847m6CJ6Yy3j-lWEF0ERF/view" },
    { name: "TIN", printed: true, id_number: "606-410-641-00000", issued_date: "—", expiration: "—", date_created: "2023", user_id: "—", password: "—", remarks: "—", front_link: "https://drive.google.com/file/d/1eQmK0ZRWDH-Ux486FpVtmH6GDlhaTQo2/view", back_link: "https://drive.google.com/file/d/1p025J1wur2DaCJkl3Afic_6yaHD3S_Zl/view" },
    { name: "Voter ID", printed: false, id_number: "—", issued_date: "—", expiration: "—", date_created: "—", user_id: "—", password: "—", remarks: "—", front_link: "", back_link: "" },
    { name: "National ID", printed: true, id_number: "5810-9328-0591-4517", issued_date: "—", expiration: "—", date_created: "2024", user_id: "—", password: "—", remarks: "—", front_link: "https://drive.google.com/file/d/1r9kCps_1BY7kSKn5b7DuPh5e3vaZ38yx/view", back_link: "https://drive.google.com/file/d/1gbA2OUQ1-JqfnlJAsu5UpPDRxTof0EMk/view" },
    { name: "Passport", printed: true, id_number: "P8011691C", issued_date: "September 19, 2024", expiration: "September 18, 2034", date_created: "2024", user_id: "—", password: "—", remarks: "—", front_link: "", back_link: "" },
    { name: "EastWest Bank", printed: true, id_number: "4375 0701 1731 8495", issued_date: "—", expiration: "01/32", date_created: "2026", user_id: "—", password: "—", remarks: "—", front_link: "", back_link: "" },
    { name: "DBP", printed: true, id_number: "4553 6651 6004 0112", issued_date: "—", expiration: "04/29", date_created: "2024", user_id: "—", password: "—", remarks: "—", front_link: "", back_link: "" },
    { name: "Driver's License", printed: true, id_number: "C05-25-01100J", issued_date: "July 21, 2025", expiration: "March 18, 2030", date_created: "2024", user_id: "—", password: "—", remarks: "Condition: C05", front_link: "https://drive.google.com/file/d/1nWtBSXF1ppYzqhWSjAa1RoeGuezeAGVG/view", back_link: "https://drive.google.com/file/d/1nfTI1ZPGONYYmfcHWmutq63GyO-dDl1z/view" },
    { name: "NBI Clearance", printed: false, id_number: "—", issued_date: "—", expiration: "—", date_created: "—", user_id: "johnselga18@gmail.com", password: "AManWord18@", remarks: "—", front_link: "", back_link: "" },
]

export const defaultCertificates: Omit<Certificate, "person_id">[] = [
    { name: "Birth Certificate (PSA)", printed: true, id_number: "123-456-789", issued_date: "2020-01-01", expiration: "Lifetime", date_created: "2020-01-01", user_id: "", password: "", remarks: "PSA Copy", link: "" },
    { name: "Baptismal Certificate", printed: true, id_number: "BAP-2000-01", issued_date: "2000-04-15", expiration: "Lifetime", date_created: "2000-04-15", user_id: "", password: "", remarks: "Original Church Copy", link: "" },
]

export const defaultFamilyMembers: FamilyMember[] = [
    {
        id: "self",
        name: "John Harold Eugenio Selga",
        relationship: "Self",
        birthday: "March 18, 2000",
        contact: "09363324878",
        favorite_food: "Pizza, Sinigang, Coffee",
        clothing_size: "Shirt: L, Shoes: 42",
        hobbies: "Software Engineering, Gaming, Tech Gadgets",
        wishlist: "Mechanical Keyboards, Smartwatch",
        notes: "Full-Stack Software Engineer"
    },
    {
        id: "1",
        name: "Luvy Molina Eugenio",
        relationship: "Mother",
        birthday: "February 01, 1975",
        contact: "09164865929",
        favorite_food: "Homecooked Dishes, Pastries",
        clothing_size: "Medium",
        hobbies: "Cooking, Gardening, Family Gatherings",
        wishlist: "Kitchen Accessories, Perfume",
        notes: "Mom"
    },
    {
        id: "2",
        name: "Arnold Sacdal Selga",
        relationship: "Father",
        birthday: "February 16, 1976",
        contact: "09914961969",
        favorite_food: "Grilled Pork, Native Coffee",
        clothing_size: "Large",
        hobbies: "Fixing House/Carpentry, Watching Basketball",
        wishlist: "Power Tools Set, Outdoor Gear",
        notes: "Dad"
    },
    {
        id: "3",
        name: "Hanna Mae Selga Alfonso",
        relationship: "Sister",
        birthday: "July 02, 1996",
        contact: "09917753390 or 09362090237",
        favorite_food: "Milk Tea, Japanese Cuisine",
        clothing_size: "Medium",
        hobbies: "Shopping, Music, Travel",
        wishlist: "Skincare Set, Handbag",
        notes: "Eldest Sister"
    },
    {
        id: "4",
        name: "Jhana Claire Eugenio Selga",
        relationship: "Sister",
        birthday: "November 08, 2004",
        contact: "09060964339",
        favorite_food: "Pasta, Chocolates, Snacks",
        clothing_size: "Small / Medium",
        hobbies: "Reading, Art & Sketching",
        wishlist: "Art Supplies, Books",
        notes: "Youngest Sister"
    },
]

// ── Expiration Helpers ──────────────────────────────────────────────────

export interface ExpirationInfo {
    status: "expired" | "expiring_soon" | "valid" | "no_expiration"
    daysRemaining: number | null
    label: string
}

export function parseExpirationDate(dateStr: string): Date | null {
    if (!dateStr || dateStr === "—" || dateStr.toLowerCase().includes("no exp") || dateStr.toLowerCase().includes("lifetime")) {
        return null
    }

    // Try MM/YY or MM/YYYY format (e.g. 01/32 or 04/29)
    if (/^\d{1,2}\/\d{2,4}$/.test(dateStr.trim())) {
        const [month, yearStr] = dateStr.trim().split("/")
        let year = parseInt(yearStr, 10)
        if (year < 100) year += 2000
        const m = parseInt(month, 10) - 1
        // Set to end of month
        return new Date(year, m + 1, 0, 23, 59, 59)
    }

    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
        return parsed
    }

    return null
}

export function getExpirationInfo(expirationDateStr: string): ExpirationInfo {
    const expDate = parseExpirationDate(expirationDateStr)
    if (!expDate) {
        return { status: "no_expiration", daysRemaining: null, label: "No Expiration" }
    }

    const now = new Date()
    const diffMs = expDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) {
        return {
            status: "expired",
            daysRemaining,
            label: `Expired ${Math.abs(daysRemaining)} days ago`
        }
    } else if (daysRemaining <= 90) {
        return {
            status: "expiring_soon",
            daysRemaining,
            label: `Expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
        }
    } else {
        return {
            status: "valid",
            daysRemaining,
            label: `Valid (${daysRemaining} days remaining)`
        }
    }
}

// ── Date Tracker Types & Utilities ──────────────────────────────────────

export interface DateTrackerItem {
    id: string
    person_id: string
    title: string
    event_type: string // Can be preset ("birthday", "marriage_anniversary", etc.) or custom string
    date: string // YYYY-MM-DD or readable date string (e.g. March 18, 2000)
    person_name?: string
    notes?: string
}

export const EVENT_TYPES = [
    { value: "birthday", label: "Birthday", emoji: "🎂" },
    { value: "marriage_anniversary", label: "Marriage Anniversary", emoji: "💍" },
    { value: "couple_anniversary", label: "Couple Anniversary", emoji: "❤️" },
    { value: "milestone", label: "Important Milestone", emoji: "🌟" },
    { value: "other", label: "Custom Event", emoji: "📅" }
] as const

export const defaultDateTrackers: DateTrackerItem[] = [
    {
        id: "dt-1",
        person_id: "self",
        title: "My Birthday",
        event_type: "birthday",
        date: "2000-03-18",
        person_name: "John Harold Eugenio Selga",
        notes: "John's Birthday celebration"
    },
    {
        id: "dt-2",
        person_id: "mother",
        title: "Mom's Birthday",
        event_type: "birthday",
        date: "1975-02-01",
        person_name: "Luvy Molina Eugenio",
        notes: "Mother's Birthday"
    },
    {
        id: "dt-3",
        person_id: "father",
        title: "Dad's Birthday",
        event_type: "birthday",
        date: "1976-02-16",
        person_name: "Arnold Sacdal Selga",
        notes: "Father's Birthday"
    },
    {
        id: "dt-4",
        person_id: "sister1",
        title: "Hanna's Birthday",
        event_type: "birthday",
        date: "1996-07-02",
        person_name: "Hanna Mae Selga Alfonso",
        notes: "Sister's Birthday"
    },
    {
        id: "dt-5",
        person_id: "sister2",
        title: "Jhana's Birthday",
        event_type: "birthday",
        date: "2004-11-08",
        person_name: "Jhana Claire Eugenio Selga",
        notes: "Sister's Birthday"
    },
    {
        id: "dt-6",
        person_id: "family",
        title: "Parents' Marriage Anniversary",
        event_type: "marriage_anniversary",
        date: "1995-11-26",
        person_name: "Luvy & Arnold Selga",
        notes: "Marriage Anniversary celebration"
    },
    {
        id: "dt-taiwan-job-contract",
        person_id: "self",
        title: "Taiwan Job Contract Expiration (3 Years)",
        event_type: "contract_renewal",
        date: "2029-08-12",
        person_name: "John Harold Eugenio Selga",
        notes: "3-Year Taiwan Work Contract Term (Starting Aug 12, 2026 – Expires Aug 12, 2029)"
    }
]

export function calculateDaysAway(dateStr: string): { daysAway: number; yearsCount: number; isToday: boolean; nextOccurrenceDate: string } {
    if (!dateStr) return { daysAway: 999, yearsCount: 0, isToday: false, nextOccurrenceDate: "" }
    
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) {
        return { daysAway: 999, yearsCount: 0, isToday: false, nextOccurrenceDate: "" }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentYear = today.getFullYear()
    const birthYear = parsed.getFullYear()

    let nextOccurrence = new Date(currentYear, parsed.getMonth(), parsed.getDate())
    
    // If date has already passed this year, jump to next year
    if (nextOccurrence < today) {
        nextOccurrence.setFullYear(currentYear + 1)
    }

    const diffTime = nextOccurrence.getTime() - today.getTime()
    const daysAway = Math.round(diffTime / (1000 * 60 * 60 * 24))
    const isToday = daysAway === 0

    // Number of years celebrating
    const yearsCount = nextOccurrence.getFullYear() - birthYear

    return {
        daysAway,
        yearsCount: Math.max(0, yearsCount),
        isToday,
        nextOccurrenceDate: nextOccurrence.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }
}
