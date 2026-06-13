import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FileText, 
    Image, 
    FileSpreadsheet, 
    FileCode, 
    Search, 
    Download, 
    Eye, 
    EyeOff,
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Printer, 
    Folder, 
    X,
    ClipboardList,
    Shield,
    CreditCard,
    GraduationCap,
    ExternalLink
} from "lucide-react"

interface ReqDocument {
    name: string
    path: string
    category: "IDs & Clearances" | "Birth & Baptism" | "School & Credentials" | "Employment & Contributions" | "Photos"
    type: "pdf" | "jpg" | "xlsx" | "docx" | "html"
    size: string
}

const rawDocuments: ReqDocument[] = [
    // IDs & Clearances
    { name: "Passport", path: "/documents/requirements/PASSPORT.pdf", category: "IDs & Clearances", type: "pdf", size: "1.01 MB" },
    { name: "Voter's Certificate", path: "/documents/requirements/Voters Certficate.jpg", category: "IDs & Clearances", type: "jpg", size: "5.24 MB" },
    { name: "Barangay Clearance", path: "/documents/requirements/need to print/Barangay Clearance.jpg", category: "IDs & Clearances", type: "jpg", size: "4.94 MB" },
    { name: "NBI Clearance", path: "/documents/requirements/NBI.jpg", category: "IDs & Clearances", type: "jpg", size: "10.43 MB" },
    { name: "Vaccine Certificate", path: "/documents/requirements/VAC CERT.pdf", category: "IDs & Clearances", type: "pdf", size: "849 KB" },
    { name: "PEOS Certificate", path: "/documents/requirements/PEOS CERTFICATE.pdf", category: "IDs & Clearances", type: "pdf", size: "61.3 KB" },
    { name: "Personal Data Sheet (PDS 2025)", path: "/documents/requirements/JOHN-HAROLD-E.-SELGA-PDS 2025.xlsx", category: "IDs & Clearances", type: "xlsx", size: "85.8 KB" },
    
    // Birth & Baptism
    { name: "Certificate of Live Birth (LCR)", path: "/documents/requirements/PSA/CERTIFICATE OF LIVE BIRTH.pdf", category: "Birth & Baptism", type: "pdf", size: "1.95 MB" },
    { name: "Local Birth Certificate Form 102", path: "/documents/requirements/PSA/Form 102 _ Local Certficate.jpg", category: "Birth & Baptism", type: "jpg", size: "5.36 MB" },
    { name: "PSA Birth Certificate (Scanned)", path: "/documents/requirements/PSA/Scanned PSA.jpg", category: "Birth & Baptism", type: "jpg", size: "296 KB" },
    { name: "PSA Birth Certificate (New)", path: "/documents/requirements/PSA/NEW PSA.jpg", category: "Birth & Baptism", type: "jpg", size: "4.46 MB" },
    { name: "Certificate of Baptism", path: "/documents/requirements/CERTIFICATE OF BAPTISM.pdf", category: "Birth & Baptism", type: "pdf", size: "501 KB" },

    // School & Credentials
    { name: "Diploma", path: "/documents/requirements/School Documents/DIPLOMA.pdf", category: "School & Credentials", type: "pdf", size: "1.11 MB" },
    { name: "Transcript of Records (TOR)", path: "/documents/requirements/School Documents/TOR.pdf", category: "School & Credentials", type: "pdf", size: "3.76 MB" },
    { name: "Transcript of Records (TOR Copy)", path: "/documents/requirements/School Documents/TOR (1).pdf", category: "School & Credentials", type: "pdf", size: "3.76 MB" },
    { name: "National Certificate II: Computer System Services", path: "/documents/requirements/Certificate/NATIONAL CERT - COMPUTER SYSTEMS SERVICING.pdf", category: "School & Credentials", type: "pdf", size: "1.62 MB" },
    { name: "National Certificate III: Events Management Services", path: "/documents/requirements/Certificate/NATIONAL CERT - EVENTS MANAGEMENT SERVICES.pdf", category: "School & Credentials", type: "pdf", size: "1.71 MB" },

    // Employment & Contributions
    { name: "Certificate of Employment (Old Capitol)", path: "/documents/requirements/COE/COE OLD CAP.jpg", category: "Employment & Contributions", type: "jpg", size: "4.27 MB" },
    { name: "Certificate of Employment (TRB Express)", path: "/documents/requirements/COE/John Harold SELGA.docx.pdf", category: "Employment & Contributions", type: "pdf", size: "266 KB" },
    { name: "SSS Contribution Form", path: "/documents/requirements/need to print/SSS.docx", category: "Employment & Contributions", type: "docx", size: "159 KB" },
    { name: "ID List and Notes", path: "/documents/requirements/id.docx", category: "Employment & Contributions", type: "docx", size: "2.26 MB" },
    { name: "SSS/Philhealth Contribution List", path: "/documents/requirements/hulog.docx", category: "Employment & Contributions", type: "docx", size: "254 KB" },
    { name: "Resume (DOCX)", path: "/documents/requirements/need to print/resume final harold (1).docx", category: "Employment & Contributions", type: "docx", size: "40 KB" },
    { name: "Resume (PDF)", path: "/documents/requirements/need to print/resume final harold (1).pdf", category: "Employment & Contributions", type: "pdf", size: "113 KB" },
    { name: "E-Registration Printout (DOCX)", path: "/documents/requirements/need to print/PrintResume.aspx.docx", category: "Employment & Contributions", type: "docx", size: "19 KB" },
    { name: "E-Registration Printout (HTML)", path: "/documents/requirements/need to print/PrintResume.aspx.html", category: "Employment & Contributions", type: "html", size: "19 KB" },

    // Photos
    { name: "2x2 Photo (1)", path: "/documents/requirements/pic/2x2 (1)_095802.jpg", category: "Photos", type: "jpg", size: "134 KB" },
    { name: "2x2 Photo (2)", path: "/documents/requirements/pic/2x2 (2)_095755.jpg", category: "Photos", type: "jpg", size: "135 KB" },
    { name: "CSC Custom Size Photo", path: "/documents/requirements/pic/Csc_095800.jpg", category: "Photos", type: "jpg", size: "106 KB" },
    { name: "Passport Size Photo", path: "/documents/requirements/pic/Passport Size_095801.jpg", category: "Photos", type: "jpg", size: "104 KB" },
]

interface NoteItem {
    id: number
    title: string
    status: "claimed" | "printing" | "completed" | "error" | "info"
    statusText: string
}

const checklistNotes: NoteItem[] = [
    { id: 1, title: "Voters Certificate", status: "claimed", statusText: "To claim / Kukunin na lang" },
    { id: 2, title: "Barangay Clearance", status: "claimed", statusText: "To claim / Kukunin na lang" },
    { id: 3, title: "NBI Clearance", status: "claimed", statusText: "To claim / Kukunin na lang" },
    { id: 4, title: "PSA Birth Certificate (QR Scan)", status: "error", statusText: "Barcode scans mismatch / QR not matching" },
    { id: 5, title: "Local Civil Registrar (LCR Form 1A & OR Form 102 with receipt)", status: "info", statusText: "Local certificate match confirmed" },
    { id: 7, title: "PEOS Certificate", status: "completed", statusText: "Completed / Meron na" },
    { id: 8, title: "E-Registration Certificate", status: "printing", statusText: "To print / Print na lang" },
    { id: 9, title: "E-Reg Details (All ID numbers & past experience list)", status: "completed", statusText: "Included & verified" },
    { id: 11, title: "National ID Card", status: "completed", statusText: "Printed / Printed na" },
    { id: 12, title: "TIN ID Card", status: "completed", statusText: "Printed / Printed na" },
    { id: 13, title: "Driver's License", status: "completed", statusText: "Printed / Printed na" },
    { id: 14, title: "Passport Book", status: "completed", statusText: "Printed / Printed na" },
    { id: 16, title: "Philhealth ID & Contribution History", status: "printing", statusText: "ID available, contribution ledger needs printing" },
    { id: 17, title: "Pag-IBIG ID & Contribution History", status: "printing", statusText: "ID available, contribution ledger needs printing" },
    { id: 18, title: "SSS ID & Contribution History", status: "printing", statusText: "Contribution ledger needs printing" },
    { id: 20, title: "College Transcript of Records (TOR)", status: "completed", statusText: "Printed / Printed na" },
    { id: 21, title: "College Diploma", status: "completed", statusText: "Printed / Printed na" },
    { id: 22, title: "NCII Computer System Services Certificate", status: "completed", statusText: "Printed / Printed na" },
    { id: 23, title: "NCIII Events Management Services Certificate", status: "completed", statusText: "Printed / Printed na" },
    { id: 25, title: "Updated Application Resume", status: "completed", statusText: "Printed / Printed na" },
    { id: 27, title: "TRB Certificate", status: "completed", statusText: "Printed & confirmed / Meron na" },
    { id: 28, title: "Old Capitol COE (Provincial Assessor's)", status: "claimed", statusText: "To claim / Kukunin pa lang" },
]

// ── Credentials Data ──────────────────────────────────────────────────
interface CredentialID {
    name: string
    printed: boolean
    idNumber: string
    issuedDate: string
    expiration: string
    dateCreated: string
    userId: string
    password: string
    remarks: string
    frontLink: string
    backLink: string
}

interface CredentialCert {
    name: string
    printed: boolean
    idNumber: string
    issuedDate: string
    expiration: string
    dateCreated: string
    userId: string
    password: string
    remarks: string
    link: string
}

const validIDs: CredentialID[] = [
    { name: "Pag-IBIG RTN", printed: false, idNumber: "922243382509", issuedDate: "—", expiration: "—", dateCreated: "2023", userId: "johnselga18@gmail.com", password: "AManword18@", remarks: "—", frontLink: "", backLink: "" },
    { name: "Pag-IBIG MID No.", printed: false, idNumber: "121306475308", issuedDate: "—", expiration: "—", dateCreated: "2023", userId: "johnselga18@gmail.com", password: "AManWord18@", remarks: "—", frontLink: "", backLink: "" },
    { name: "SSS UMID", printed: false, idNumber: "02-4734797-9", issuedDate: "—", expiration: "—", dateCreated: "2023", userId: "SAGIED18", password: "Selgaharold18@", remarks: "Number only", frontLink: "", backLink: "" },
    { name: "PhilHealth", printed: true, idNumber: "21-251027063-8", issuedDate: "—", expiration: "—", dateCreated: "2023", userId: "21-251027063-8", password: "AManWord18@", remarks: "—", frontLink: "https://drive.google.com/file/d/1gfKvtFq0ewCwdgdF2C7wa3c7vqI3tJAf/view", backLink: "https://drive.google.com/file/d/1_LmHPlDhj6k847m6CJ6Yy3j-lWEF0ERF/view" },
    { name: "TIN", printed: true, idNumber: "606-410-641-00000", issuedDate: "—", expiration: "—", dateCreated: "2023", userId: "—", password: "—", remarks: "—", frontLink: "https://drive.google.com/file/d/1eQmK0ZRWDH-Ux486FpVtmH6GDlhaTQo2/view", backLink: "https://drive.google.com/file/d/1p025J1wur2DaCJkl3Afic_6yaHD3S_Zl/view" },
    { name: "Voter ID", printed: false, idNumber: "—", issuedDate: "—", expiration: "—", dateCreated: "—", userId: "—", password: "—", remarks: "—", frontLink: "", backLink: "" },
    { name: "National ID", printed: true, idNumber: "5810-9328-0591-4517", issuedDate: "—", expiration: "—", dateCreated: "2024", userId: "—", password: "—", remarks: "—", frontLink: "https://drive.google.com/file/d/1r9kCps_1BY7kSKn5b7DuPh5e3vaZ38yx/view", backLink: "https://drive.google.com/file/d/1gbA2OUQ1-JqfnlJAsu5UpPDRxTof0EMk/view" },
    { name: "Passport", printed: true, idNumber: "P8011691C", issuedDate: "September 19, 2024", expiration: "September 18, 2034", dateCreated: "2024", userId: "—", password: "—", remarks: "—", frontLink: "", backLink: "" },
    { name: "EastWest Bank", printed: true, idNumber: "4375 0701 1731 8495", issuedDate: "—", expiration: "01/32", dateCreated: "2026", userId: "—", password: "—", remarks: "—", frontLink: "", backLink: "" },
    { name: "DBP", printed: true, idNumber: "4553 6651 6004 0112", issuedDate: "—", expiration: "04/29", dateCreated: "2024", userId: "—", password: "—", remarks: "—", frontLink: "", backLink: "" },
    { name: "Driver's License", printed: true, idNumber: "C05-25-01100J", issuedDate: "July 21, 2025", expiration: "March 18, 2030", dateCreated: "2024", userId: "—", password: "—", remarks: "Condition: C05", frontLink: "https://drive.google.com/file/d/1nWtBSXF1ppYzqhWSjAa1RoeGuezeAGVG/view", backLink: "https://drive.google.com/file/d/1nfTI1ZPGONYYmfcHWmutq63GyO-dDl1z/view" },
    { name: "NBI Clearance", printed: false, idNumber: "—", issuedDate: "—", expiration: "—", dateCreated: "—", userId: "johnselga18@gmail.com", password: "AManWord18@", remarks: "—", frontLink: "", backLink: "" },
]

const certificates: CredentialCert[] = [
    { name: "Transcript of Records (TOR)", printed: true, idNumber: "CRT", issuedDate: "—", expiration: "—", dateCreated: "—", userId: "—", password: "—", remarks: "—", link: "" },
    { name: "Diploma", printed: true, idNumber: "CRT", issuedDate: "July 2, 2022", expiration: "—", dateCreated: "—", userId: "—", password: "—", remarks: "—", link: "" },
    { name: "Certificate of Employment (COE)", printed: true, idNumber: "TRB EXPRESS INC", issuedDate: "June 2025", expiration: "—", dateCreated: "—", userId: "2024082152978", password: "Selga John Harold", remarks: "Supervisor IT Jr.", link: "https://drive.google.com/file/d/1IPrksP4kfHS2dqnJTIF7_i560DbbzQgk/view" },
    { name: "PEOS Certificate", printed: false, idNumber: "2974206", issuedDate: "—", expiration: "—", dateCreated: "August 26, 2024", userId: "jharoldselga18@gmail.com", password: "AManWord18@", remarks: "—", link: "https://drive.google.com/file/d/1pS7MKjxwUVswWVOPrGxmI224SydtM6ZA/view" },
    { name: "E-Registration Certificate", printed: false, idNumber: "2024082152978", issuedDate: "—", expiration: "—", dateCreated: "August 26, 2024", userId: "—", password: "—", remarks: "—", link: "https://drive.google.com/file/d/1RhhGCOUu4_QyK1Sf2btrvwUYJX1Wirw6/view" },
    { name: "NC II - Computer System Services", printed: true, idNumber: "210349022116611", issuedDate: "June 1, 2021", expiration: "May 31, 2026", dateCreated: "—", userId: "—", password: "—", remarks: "TESDA", link: "" },
    { name: "NC II - Events Management Services", printed: true, idNumber: "22034039109", issuedDate: "October 20, 2022", expiration: "October 19, 2027", dateCreated: "—", userId: "—", password: "—", remarks: "TESDA", link: "" },
]

export default function Requirements() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [previewDoc, setPreviewDoc] = useState<{ name: string; path: string; type: string } | null>(null)
    const [showSensitive, setShowSensitive] = useState(false)

    // Programmatically sort files alphabetically within each category (or overall)
    const filteredDocuments = useMemo(() => {
        const matchingDocs = rawDocuments.filter((doc) => {
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory
            return matchesSearch && matchesCategory
        })

        // Sort alphabetically
        return [...matchingDocs].sort((a, b) => a.name.localeCompare(b.name))
    }, [searchQuery, selectedCategory])

    const getIcon = (type: string) => {
        switch (type) {
            case "pdf":
                return <FileText className="h-6 w-6 text-rose-500" />
            case "jpg":
                return <Image className="h-6 w-6 text-emerald-500" />
            case "xlsx":
                return <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            case "docx":
                return <FileCode className="h-6 w-6 text-amber-500" />
            case "html":
                return <FileCode className="h-6 w-6 text-orange-500" />
            default:
                return <Folder className="h-6 w-6 text-muted-foreground" />
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            case "error":
                return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            case "claimed":
                return <Clock className="h-5 w-5 text-orange-500 shrink-0" />
            case "printing":
                return <Printer className="h-5 w-5 text-amber-500 shrink-0" />
            case "info":
                return <AlertCircle className="h-5 w-5 text-stone-400 shrink-0" />
            default:
                return null
        }
    }

    const getStatusBadge = (status: string) => {
        const baseClass = "px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border shrink-0"
        switch (status) {
            case "completed":
                return <span className={`${baseClass} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>Completed</span>
            case "error":
                return <span className={`${baseClass} bg-rose-500/10 text-rose-500 border-rose-500/20`}>Action Required</span>
            case "claimed":
                return <span className={`${baseClass} bg-orange-500/10 text-orange-500 border-orange-500/20`}>To Claim</span>
            case "printing":
                return <span className={`${baseClass} bg-amber-500/10 text-amber-500 border-amber-500/20`}>To Print</span>
            case "info":
                return <span className={`${baseClass} bg-stone-500/10 text-stone-500 border-stone-500/20`}>Confirmed</span>
            default:
                return null
        }
    }

    const maskValue = (value: string) => {
        if (value === "—") return "—"
        return showSensitive ? value : "••••••••"
    }

    const categories = ["All", "IDs & Clearances", "Birth & Baptism", "School & Credentials", "Employment & Contributions", "Photos", "Checklist", "Credentials"]

    const getCategoryCount = (category: string) => {
        if (category === "All") return rawDocuments.length
        if (category === "Checklist") return checklistNotes.length
        if (category === "Credentials") return validIDs.length + certificates.length
        return rawDocuments.filter((doc) => doc.category === category).length
    }

    const handleDownloadAll = () => {
        filteredDocuments.forEach((doc, idx) => {
            setTimeout(() => {
                const link = document.createElement("a")
                link.href = doc.path
                link.download = `${doc.name}.${doc.type}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }, idx * 300)
        })
    }

    const getDocForNote = (title: string) => {
        const normalizedNote = title.toLowerCase().replace(/[^a-z0-9]/g, "")
        return rawDocuments.find((doc) => {
            const normalizedDocName = doc.name.toLowerCase().replace(/[^a-z0-9]/g, "")
            return normalizedDocName.includes(normalizedNote) || normalizedNote.includes(normalizedDocName)
        })
    }

    const isDocumentView = selectedCategory !== "Checklist" && selectedCategory !== "Credentials"

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
                            Document <span className="text-primary">Requirements</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-xl text-sm md:text-base">
                            Private repository storing personal clearances, academic credentials, and official identification certificates.
                        </p>
                    </div>

                    {/* Search and Action Buttons */}
                    {isDocumentView && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-card border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                                />
                            </div>

                            {filteredDocuments.length > 0 && (
                                <button
                                    onClick={handleDownloadAll}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download All ({filteredDocuments.length})</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Category navigation tabs */}
                <div className="flex border-b border-border/40 gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                                cat === selectedCategory
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span>{cat}</span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${
                                cat === selectedCategory
                                    ? "bg-primary/10 border-primary/20 text-primary"
                                    : "bg-muted border-border/40 text-muted-foreground"
                            }`}>
                                {getCategoryCount(cat)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {selectedCategory === "Credentials" ? (
                        <CredentialsView
                            showSensitive={showSensitive}
                            setShowSensitive={setShowSensitive}
                            maskValue={maskValue}
                        />
                    ) : selectedCategory === "Checklist" ? (
                        <motion.div
                            key="checklist"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
                        >
                            <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Status Checklist</h2>
                                    <p className="text-xs text-muted-foreground font-medium">Tracking file completions and outstanding tasks from NOTES.txt</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {checklistNotes.map((note) => (
                                    <div 
                                        key={note.id}
                                        className="flex items-start gap-3.5 p-4 bg-background border border-border/30 rounded-2xl transition-all hover:border-primary/20 hover:shadow-md"
                                    >
                                        {getStatusIcon(note.status)}
                                        <div className="space-y-1.5 min-w-0">
                                            <h3 className="font-bold text-sm text-foreground leading-snug break-words">
                                                {note.title}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap w-full">
                                                {getStatusBadge(note.status)}
                                                <span className="text-[11px] text-muted-foreground font-medium leading-none">
                                                    {note.statusText}
                                                </span>
                                                {(() => {
                                                    const matchingDoc = getDocForNote(note.title)
                                                    if (matchingDoc && (matchingDoc.type === "pdf" || matchingDoc.type === "jpg")) {
                                                        return (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setPreviewDoc({ name: matchingDoc.name, path: matchingDoc.path, type: matchingDoc.type })
                                                                }}
                                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors ml-auto bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded border border-primary/10"
                                                                title={`View ${matchingDoc.name}`}
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                                <span>View File</span>
                                                            </button>
                                                        )
                                                    }
                                                    return null
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-stone-900 text-white text-left">
                                            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Document Name</th>
                                            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Category</th>
                                            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Size & Type</th>
                                            <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredDocuments.length > 0 ? (
                                            filteredDocuments.map((doc) => (
                                                <tr key={doc.name} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-foreground whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-muted rounded-lg shrink-0">
                                                                {getIcon(doc.type)}
                                                            </div>
                                                            <span>{doc.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-[11px] text-primary/70 font-semibold truncate bg-primary/5 border border-primary/10 rounded-full px-2.5 py-0.5 w-fit">
                                                            {doc.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                                                        <span className="uppercase font-bold">{doc.type}</span> • {doc.size}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {(doc.type === "pdf" || doc.type === "jpg") ? (
                                                                <button
                                                                    onClick={() => setPreviewDoc({ name: doc.name, path: doc.path, type: doc.type })}
                                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    <span>View</span>
                                                                </button>
                                                            ) : (
                                                                <span className="px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider bg-background/50 border border-border/20 rounded-lg">
                                                                    Download Only
                                                                </span>
                                                            )}
                                                            <a
                                                                href={doc.path}
                                                                download={doc.name + "." + doc.type}
                                                                className="inline-flex items-center justify-center p-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-all hover:scale-105"
                                                                title={`Download ${doc.name}`}
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center text-center">
                                                        <Folder className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                                        <h3 className="font-bold text-lg">No requirements found</h3>
                                                        <p className="text-muted-foreground text-sm max-w-xs mt-1">Please try modifying your search filter or active category.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Previews Modal */}
                <AnimatePresence>
                    {previewDoc && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
                            onClick={() => setPreviewDoc(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-card w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border/50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="px-6 py-4 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            {previewDoc.type === "pdf" ? <FileText className="h-5 w-5" /> : <Image className="h-5 w-5" />}
                                        </div>
                                        <h3 className="font-bold text-lg text-foreground truncate max-w-md md:max-w-xl">
                                            {previewDoc.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={previewDoc.path}
                                            download={previewDoc.name + "." + previewDoc.type}
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span>Download</span>
                                        </a>
                                        <button
                                            onClick={() => setPreviewDoc(null)}
                                            className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body / Preview Frame */}
                                <div className="flex-1 bg-black/5 flex items-center justify-center overflow-hidden">
                                    {previewDoc.type === "pdf" ? (
                                        <iframe
                                            src={`${previewDoc.path}#toolbar=1`}
                                            className="w-full h-full border-none bg-background"
                                            title={previewDoc.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full p-4 md:p-8 flex items-center justify-center cursor-zoom-out" onClick={() => setPreviewDoc(null)}>
                                            <img
                                                src={previewDoc.path}
                                                alt={previewDoc.name}
                                                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ── Credentials Tab Component ─────────────────────────────────────────
function CredentialsView({ showSensitive, setShowSensitive, maskValue }: {
    showSensitive: boolean
    setShowSensitive: (v: boolean) => void
    maskValue: (v: string) => string
}) {
    return (
        <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
        >
            {/* Sensitive Toggle */}
            <div className="flex items-center justify-between bg-card border border-border/40 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Sensitive Data Protection</h3>
                        <p className="text-xs text-muted-foreground">UserID and Password fields are hidden by default</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowSensitive(!showSensitive)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        showSensitive
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                >
                    {showSensitive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showSensitive ? "Hide Sensitive" : "Show Sensitive"}
                </button>
            </div>

            {/* Valid IDs Table */}
            <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-border/30">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Valid IDs</h2>
                        <p className="text-xs text-muted-foreground font-medium">{validIDs.length} records — Government, bank, and personal identification</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-stone-900 text-white text-left">
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">ID Name</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-center">Printed</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">ID / Card Number</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Issued</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Expiration</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Year</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">User ID</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Password</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Remarks</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-center">Scans</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {validIDs.map((id, i) => (
                                <tr key={i} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{id.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        {id.printed ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-500/10">
                                                <X className="h-3.5 w-3.5 text-stone-400" />
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-foreground/80 whitespace-nowrap">{id.idNumber}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.issuedDate}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.expiration}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.dateCreated}</td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">
                                        <span className={!showSensitive && id.userId !== "—" ? "select-none" : ""}>
                                            {maskValue(id.userId)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">
                                        <span className={!showSensitive && id.password !== "—" ? "select-none" : ""}>
                                            {maskValue(id.password)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.remarks}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {id.frontLink && (
                                                <a href={id.frontLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">
                                                    <ExternalLink className="h-3 w-3" /> Front
                                                </a>
                                            )}
                                            {id.backLink && (
                                                <a href={id.backLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-500/10 text-stone-400 text-[10px] font-bold hover:bg-stone-500/20 transition-colors">
                                                    <ExternalLink className="h-3 w-3" /> Back
                                                </a>
                                            )}
                                            {!id.frontLink && !id.backLink && (
                                                <span className="text-[10px] text-muted-foreground/40 font-bold">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-border/30">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Certificates</h2>
                        <p className="text-xs text-muted-foreground font-medium">{certificates.length} records — Academic, employment, and government certifications</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-stone-900 text-white text-left">
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Certificate</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-center">Printed</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">ID / Reference</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Issued</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Expiration</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Created</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">User ID</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Password</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Remarks</th>
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-center">Link</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {certificates.map((cert, i) => (
                                <tr key={i} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{cert.name}</td>
                                    <td className="px-4 py-3 text-center">
                                        {cert.printed ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-500/10">
                                                <X className="h-3.5 w-3.5 text-stone-400" />
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-foreground/80 whitespace-nowrap">{cert.idNumber}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.issuedDate}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.expiration}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.dateCreated}</td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">
                                        <span className={!showSensitive && cert.userId !== "—" ? "select-none" : ""}>
                                            {maskValue(cert.userId)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">
                                        <span className={!showSensitive && cert.password !== "—" ? "select-none" : ""}>
                                            {maskValue(cert.password)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.remarks}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        {cert.link ? (
                                            <a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">
                                                <ExternalLink className="h-3 w-3" /> View
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground/40 font-bold">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}
