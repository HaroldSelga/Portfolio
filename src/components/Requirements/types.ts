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
    relationship: "Mother" | "Father" | "Sister" | "Brother" | "Wife" | "Husband" | "Girlfriend" | "Boyfriend" | "Other" | "Self"
    birthday: string
    contact: string
    linked_to?: string  // ID of partner/spouse for couple grouping
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

// Relationship options
export const RELATIONSHIPS = ["Mother", "Father", "Sister", "Brother", "Wife", "Husband", "Girlfriend", "Boyfriend", "Other"] as const

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
    { name: "Transcript of Records (TOR)", printed: true, id_number: "CRT", issued_date: "—", expiration: "—", date_created: "—", user_id: "—", password: "—", remarks: "—", link: "" },
    { name: "Diploma", printed: true, id_number: "CRT", issued_date: "July 2, 2022", expiration: "—", date_created: "—", user_id: "—", password: "—", remarks: "—", link: "" },
    { name: "Certificate of Employment (COE)", printed: true, id_number: "TRB EXPRESS INC", issued_date: "June 2025", expiration: "—", date_created: "—", user_id: "2024082152978", password: "Selga John Harold", remarks: "Supervisor IT Jr.", link: "https://drive.google.com/file/d/1IPrksP4kfHS2dqnJTIF7_i560DbbzQgk/view" },
    { name: "PEOS Certificate", printed: false, id_number: "2974206", issued_date: "—", expiration: "—", date_created: "August 26, 2024", user_id: "jharoldselga18@gmail.com", password: "AManWord18@", remarks: "—", link: "https://drive.google.com/file/d/1pS7MKjxwUVswWVOPrGxmI224SydtM6ZA/view" },
    { name: "E-Registration Certificate", printed: false, id_number: "2024082152978", issued_date: "—", expiration: "—", date_created: "August 26, 2024", user_id: "—", password: "—", remarks: "—", link: "https://drive.google.com/file/d/1RhhGCOUu4_QyK1Sf2btrvwUYJX1Wirw6/view" },
    { name: "NC II - Computer System Services", printed: true, id_number: "210349022116611", issued_date: "June 1, 2021", expiration: "May 31, 2026", date_created: "—", user_id: "—", password: "—", remarks: "TESDA", link: "" },
    { name: "NC II - Events Management Services", printed: true, id_number: "22034039109", issued_date: "October 20, 2022", expiration: "October 19, 2027", date_created: "—", user_id: "—", password: "—", remarks: "TESDA", link: "" },
]

export const defaultFamilyMembers: FamilyMember[] = [
    { id: "self", name: "John Harold Eugenio Selga", relationship: "Self", birthday: "March 18, 2000", contact: "09363324878" },
    { id: "1", name: "Luvy Molina Eugenio", relationship: "Mother", birthday: "February 01, 1975", contact: "09164865929" },
    { id: "2", name: "Arnold Sacdal Selga", relationship: "Father", birthday: "February 16, 1976", contact: "09914961969" },
    { id: "3", name: "Hanna Mae Selga Alfonso", relationship: "Sister", birthday: "July 02, 1996", contact: "09917753390 or 09362090237" },
    { id: "4", name: "Jhana Claire Eugenio Selga", relationship: "Sister", birthday: "November 08, 2004", contact: "09060964339" },
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
