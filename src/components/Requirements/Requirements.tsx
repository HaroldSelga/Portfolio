import { useState, useMemo, useEffect } from "react"
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
    CreditCard,
    GraduationCap,
    ExternalLink,

    Users,
    Heart,
    Calendar,
    Phone,
    Plus,
    Trash2,
    Edit2,
    Save,
    Loader2
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import type { 
    ReqDocument, 
    ChecklistItem, 
    ValidID, 
    Certificate, 
    FamilyMember
} from "./types"
import {
    defaultDocuments,
    defaultChecklist,
    defaultValidIDs,
    defaultCertificates,
    defaultFamilyMembers
} from "./types"

import DocumentModal from "./DocumentModal"
import ChecklistModal from "./ChecklistModal"
import ValidIDModal from "./ValidIDModal"
import CertificateModal from "./CertificateModal"


export default function Requirements() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [previewDoc, setPreviewDoc] = useState<{ name: string; path: string; type: string } | null>(null)
    const [showSensitive, setShowSensitive] = useState(false)

    // Person Ownership State
    const [selectedPerson, setSelectedPerson] = useState<string>("self")

    // Requirement Datasets
    const [documents, setDocuments] = useState<ReqDocument[]>([])
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
    const [validIDs, setValidIDs] = useState<ValidID[]>([])
    const [certificates, setCertificates] = useState<Certificate[]>([])

    // Loading states per dataset
    const [isDocsLoading, setIsDocsLoading] = useState(true)
    const [isChecklistLoading, setIsChecklistLoading] = useState(true)
    const [isCredentialsLoading, setIsCredentialsLoading] = useState(true)

    // CRUD Modal triggers and active edit items
    const [isDocModalOpen, setIsDocModalOpen] = useState(false)
    const [editingDoc, setEditingDoc] = useState<ReqDocument | null>(null)

    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false)
    const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null)

    const [isValidIDModalOpen, setIsValidIDModalOpen] = useState(false)
    const [editingValidID, setEditingValidID] = useState<ValidID | null>(null)

    const [isCertModalOpen, setIsCertModalOpen] = useState(false)
    const [editingCert, setEditingCert] = useState<Certificate | null>(null)

    // Family states
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [marriageDate, setMarriageDate] = useState<string>("November 26, 1995")
    const [isFamilyLoading, setIsFamilyLoading] = useState(true)
    const [isFamilySaving, setIsFamilySaving] = useState(false)
    const [useLocalStorageFallback, setUseLocalStorageFallback] = useState(false)

    // Inline editing for parents' marriage date
    const [isEditingMarriageDate, setIsEditingMarriageDate] = useState(false)
    const [marriageDateInput, setMarriageDateInput] = useState(marriageDate)

    // Family Member Add/Edit Form Modal State
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
    const [formName, setFormName] = useState("")
    const [formRelationship, setFormRelationship] = useState<FamilyMember["relationship"]>("Sister")
    const [formBirthday, setFormBirthday] = useState("")
    const [formContact, setFormContact] = useState("")


    // Fetch family list and anniversary metadata on mount
    useEffect(() => {
        async function fetchInitialFamilyAndMeta() {
            try {
                setIsFamilyLoading(true)
                const { data: members, error: membersError } = await supabase
                    .from("family_members")
                    .select("*")

                if (membersError) throw membersError

                const { data: meta, error: metaError } = await supabase
                    .from("family_metadata")
                    .select("value")
                    .eq("key", "parents_marriage_date")
                    .maybeSingle()

                if (metaError) throw metaError

                if (members) {
                    setFamilyMembers(members)
                }
                if (meta?.value) {
                    setMarriageDate(meta.value)
                    setMarriageDateInput(meta.value)
                }
                setUseLocalStorageFallback(false)
            } catch (e) {
                console.warn("Error fetching initial family data from Supabase, switching to LocalStorage fallback:", e)
                setUseLocalStorageFallback(true)
                
                const savedMembers = localStorage.getItem("family_members")
                if (savedMembers) {
                    setFamilyMembers(JSON.parse(savedMembers))
                } else {
                    setFamilyMembers(defaultFamilyMembers)
                }
                
                const savedMarriage = localStorage.getItem("parents_marriage_date")
                if (savedMarriage) {
                    setMarriageDate(savedMarriage)
                    setMarriageDateInput(savedMarriage)
                }
            } finally {
                setIsFamilyLoading(false)
            }
        }
        fetchInitialFamilyAndMeta()
    }, [])

    // Sync tab data depending on selected tab & selected person
    useEffect(() => {
        async function fetchDocumentsData() {
            try {
                setIsDocsLoading(true)
                const { data, error } = await supabase
                    .from("req_documents")
                    .select("*")
                    .eq("person_id", selectedPerson)
                    .order("id", { ascending: true })

                if (error) throw error
                if (data) setDocuments(data)
            } catch (e) {
                console.warn("Error fetching documents, switching to localStorage fallback:", e)
                const key = `req_documents_${selectedPerson}`
                const saved = localStorage.getItem(key)
                if (saved) {
                    setDocuments(JSON.parse(saved))
                } else {
                    const fallback = selectedPerson === "self"
                        ? defaultDocuments.map((d, i) => ({ ...d, id: i + 1, person_id: "self" } as ReqDocument))
                        : []
                    setDocuments(fallback)
                    localStorage.setItem(key, JSON.stringify(fallback))
                }
            } finally {
                setIsDocsLoading(false)
            }
        }

        async function fetchChecklistData() {
            try {
                setIsChecklistLoading(true)
                const { data, error } = await supabase
                    .from("req_checklist")
                    .select("*")
                    .eq("person_id", selectedPerson)
                    .order("id", { ascending: true })

                if (error) throw error
                if (data) setChecklistItems(data)
            } catch (e) {
                console.warn("Error fetching checklist, switching to localStorage fallback:", e)
                const key = `req_checklist_${selectedPerson}`
                const saved = localStorage.getItem(key)
                if (saved) {
                    setChecklistItems(JSON.parse(saved))
                } else {
                    const fallback = selectedPerson === "self"
                        ? defaultChecklist.map((c, i) => ({ ...c, id: i + 1, person_id: "self" } as ChecklistItem))
                        : []
                    setChecklistItems(fallback)
                    localStorage.setItem(key, JSON.stringify(fallback))
                }
            } finally {
                setIsChecklistLoading(false)
            }
        }

        async function fetchCredentialsData() {
            try {
                setIsCredentialsLoading(true)
                const { data: ids, error: idsError } = await supabase
                    .from("req_valid_ids")
                    .select("*")
                    .eq("person_id", selectedPerson)
                    .order("id", { ascending: true })

                if (idsError) throw idsError

                const { data: certs, error: certsError } = await supabase
                    .from("req_certificates")
                    .select("*")
                    .eq("person_id", selectedPerson)
                    .order("id", { ascending: true })

                if (certsError) throw certsError

                if (ids) setValidIDs(ids)
                if (certs) setCertificates(certs)
            } catch (e) {
                console.warn("Error fetching credentials, switching to localStorage fallback:", e)
                const idsKey = `req_valid_ids_${selectedPerson}`
                const certsKey = `req_certificates_${selectedPerson}`

                const savedIds = localStorage.getItem(idsKey)
                const savedCerts = localStorage.getItem(certsKey)

                if (savedIds) setValidIDs(JSON.parse(savedIds))
                else {
                    const fallback = selectedPerson === "self"
                        ? defaultValidIDs.map((v, i) => ({ ...v, id: i + 1, person_id: "self" } as ValidID))
                        : []
                    setValidIDs(fallback)
                    localStorage.setItem(idsKey, JSON.stringify(fallback))
                }

                if (savedCerts) setCertificates(JSON.parse(savedCerts))
                else {
                    const fallback = selectedPerson === "self"
                        ? defaultCertificates.map((c, i) => ({ ...c, id: i + 1, person_id: "self" } as Certificate))
                        : []
                    setCertificates(fallback)
                    localStorage.setItem(certsKey, JSON.stringify(fallback))
                }
            } finally {
                setIsCredentialsLoading(false)
            }
        }

        if (selectedCategory === "Checklist") {
            fetchChecklistData()
        } else if (selectedCategory === "Credentials") {
            fetchCredentialsData()
        } else if (selectedCategory !== "Family") {
            fetchDocumentsData()
        }
    }, [selectedCategory, selectedPerson])

    // Programmatically sort files alphabetically within each category (or overall)
    const filteredDocuments = useMemo(() => {
        const matchingDocs = documents.filter((doc) => {
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory
            return matchesSearch && matchesCategory
        })

        // Sort alphabetically
        return [...matchingDocs].sort((a, b) => a.name.localeCompare(b.name))
    }, [searchQuery, selectedCategory, documents])

    const getIcon = (type: string) => {
        switch (type) {
            case "pdf":
                return <FileText className="h-6 w-6 text-rose-500" />
            case "jpg":
            case "png":
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

    const calculateAge = (birthdayStr: string) => {
        if (!birthdayStr) return null
        try {
            // Clean up common typo cases
            const cleaned = birthdayStr.replace("February 016", "February 16")
            const parsed = Date.parse(cleaned)
            if (isNaN(parsed)) return null
            const birthday = new Date(parsed)
            const today = new Date()
            let age = today.getFullYear() - birthday.getFullYear()
            const monthDiff = today.getMonth() - birthday.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
                age--
            }
            return age
        } catch (e) {
            return null
        }
    }

    const getYearsOfMarriage = (dateStr: string) => {
        if (!dateStr) return null
        try {
            const parsed = Date.parse(dateStr)
            if (isNaN(parsed)) return null
            const marriage = new Date(parsed)
            const today = new Date()
            let years = today.getFullYear() - marriage.getFullYear()
            const monthDiff = today.getMonth() - marriage.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < marriage.getDate())) {
                years--
            }
            return years
        } catch (e) {
            return null
        }
    }


    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formName.trim() || !formBirthday.trim() || !formContact.trim()) return

        const payload: FamilyMember = {
            id: editingMember ? editingMember.id : Date.now().toString(),
            name: formName,
            relationship: formRelationship,
            birthday: formBirthday,
            contact: formContact
        }

        try {
            setIsFamilySaving(true)
            if (!useLocalStorageFallback) {
                const { error } = await supabase
                    .from("family_members")
                    .upsert([payload])

                if (error) throw error
            }

            let updated: FamilyMember[]
            if (editingMember) {
                updated = familyMembers.map((m) => m.id === editingMember.id ? payload : m)
            } else {
                updated = [...familyMembers, payload]
            }
            setFamilyMembers(updated)
            localStorage.setItem("family_members", JSON.stringify(updated))
            setIsFamilyModalOpen(false)
        } catch (err) {
            console.error("Error saving family member to Supabase, updating locally only:", err)
            alert("Failed to save to cloud. Ensure you have run the SQL setup in Supabase. Saving to Local Storage instead.")
            setUseLocalStorageFallback(true)

            let updated: FamilyMember[]
            if (editingMember) {
                updated = familyMembers.map((m) => m.id === editingMember.id ? payload : m)
            } else {
                updated = [...familyMembers, payload]
            }
            setFamilyMembers(updated)
            localStorage.setItem("family_members", JSON.stringify(updated))
            setIsFamilyModalOpen(false)
        } finally {
            setIsFamilySaving(false)
        }
    }

    const handleDeleteMember = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                setIsFamilySaving(true)
                if (!useLocalStorageFallback) {
                    const { error } = await supabase
                        .from("family_members")
                        .delete()
                        .eq("id", id)

                    if (error) throw error
                }

                const updated = familyMembers.filter((m) => m.id !== id)
                setFamilyMembers(updated)
                localStorage.setItem("family_members", JSON.stringify(updated))
            } catch (err) {
                console.error("Error deleting family member from Supabase, updating locally only:", err)
                alert("Failed to delete from cloud. Deleting from Local Storage instead.")
                setUseLocalStorageFallback(true)
                
                const updated = familyMembers.filter((m) => m.id !== id)
                setFamilyMembers(updated)
                localStorage.setItem("family_members", JSON.stringify(updated))
            } finally {
                setIsFamilySaving(false)
            }
        }
    }

    const handleSaveMarriageDate = async () => {
        if (!marriageDateInput.trim()) return
        try {
            setIsFamilySaving(true)
            if (!useLocalStorageFallback) {
                const { error } = await supabase
                    .from("family_metadata")
                    .upsert({ key: "parents_marriage_date", value: marriageDateInput })

                if (error) throw error
            }

            setMarriageDate(marriageDateInput)
            localStorage.setItem("parents_marriage_date", marriageDateInput)
            setIsEditingMarriageDate(false)
        } catch (err) {
            console.error("Error saving marriage date to Supabase, updating locally only:", err)
            alert("Failed to save marriage date to cloud. Saving to Local Storage instead.")
            setUseLocalStorageFallback(true)
            
            setMarriageDate(marriageDateInput)
            localStorage.setItem("parents_marriage_date", marriageDateInput)
            setIsEditingMarriageDate(false)
        } finally {
            setIsFamilySaving(false)
        }
    }

    // Document CRUD
    const handleSaveDocument = async (doc: ReqDocument) => {
        const isEdit = !!doc.id
        try {
            const { data, error } = await supabase
                .from("req_documents")
                .upsert([doc])
                .select()

            if (error) throw error

            const savedDoc = data?.[0] || doc
            let updatedDocs: ReqDocument[]
            if (isEdit) {
                updatedDocs = documents.map(d => d.id === doc.id ? savedDoc : d)
            } else {
                updatedDocs = [...documents, savedDoc]
            }
            setDocuments(updatedDocs)
            localStorage.setItem(`req_documents_${selectedPerson}`, JSON.stringify(updatedDocs))
        } catch (e) {
            console.warn("Failed to save doc to Supabase, using localStorage fallback:", e)
            const mockDoc = { ...doc, id: doc.id || Date.now() }
            let updatedDocs: ReqDocument[]
            if (isEdit) {
                updatedDocs = documents.map(d => d.id === doc.id ? mockDoc : d)
            } else {
                updatedDocs = [...documents, mockDoc]
            }
            setDocuments(updatedDocs)
            localStorage.setItem(`req_documents_${selectedPerson}`, JSON.stringify(updatedDocs))
        }
    }

    const handleDeleteDocument = async (id: number, path: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return
        try {
            const { error } = await supabase
                .from("req_documents")
                .delete()
                .eq("id", id)

            if (error) throw error

            // Remove file from storage if uploaded to Supabase Storage
            if (path.includes("supabase.co/storage")) {
                try {
                    const parts = path.split("/requirements/")
                    if (parts.length > 1) {
                        const storagePath = parts[1]
                        await supabase.storage.from("requirements").remove([storagePath])
                    }
                } catch (storageErr) {
                    console.warn("Could not delete physical file from storage:", storageErr)
                }
            }

            const updatedDocs = documents.filter(d => d.id !== id)
            setDocuments(updatedDocs)
            localStorage.setItem(`req_documents_${selectedPerson}`, JSON.stringify(updatedDocs))
        } catch (e) {
            console.warn("Failed to delete doc, removing locally:", e)
            const updatedDocs = documents.filter(d => d.id !== id)
            setDocuments(updatedDocs)
            localStorage.setItem(`req_documents_${selectedPerson}`, JSON.stringify(updatedDocs))
        }
    }

    // Checklist CRUD
    const handleSaveChecklistItem = async (item: ChecklistItem) => {
        const isEdit = !!item.id
        try {
            const { data, error } = await supabase
                .from("req_checklist")
                .upsert([item])
                .select()

            if (error) throw error

            const savedItem = data?.[0] || item
            let updatedItems: ChecklistItem[]
            if (isEdit) {
                updatedItems = checklistItems.map(c => c.id === item.id ? savedItem : c)
            } else {
                updatedItems = [...checklistItems, savedItem]
            }
            setChecklistItems(updatedItems)
            localStorage.setItem(`req_checklist_${selectedPerson}`, JSON.stringify(updatedItems))
        } catch (e) {
            console.warn("Failed to save checklist to Supabase, saving locally:", e)
            const mockItem = { ...item, id: item.id || Date.now() }
            let updatedItems: ChecklistItem[]
            if (isEdit) {
                updatedItems = checklistItems.map(c => c.id === item.id ? mockItem : c)
            } else {
                updatedItems = [...checklistItems, mockItem]
            }
            setChecklistItems(updatedItems)
            localStorage.setItem(`req_checklist_${selectedPerson}`, JSON.stringify(updatedItems))
        }
    }

    const handleDeleteChecklistItem = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}" checklist item?`)) return
        try {
            const { error } = await supabase
                .from("req_checklist")
                .delete()
                .eq("id", id)

            if (error) throw error

            const updatedItems = checklistItems.filter(c => c.id !== id)
            setChecklistItems(updatedItems)
            localStorage.setItem(`req_checklist_${selectedPerson}`, JSON.stringify(updatedItems))
        } catch (e) {
            console.warn("Failed to delete checklist item, removing locally:", e)
            const updatedItems = checklistItems.filter(c => c.id !== id)
            setChecklistItems(updatedItems)
            localStorage.setItem(`req_checklist_${selectedPerson}`, JSON.stringify(updatedItems))
        }
    }

    // Valid IDs CRUD
    const handleSaveValidID = async (validID: ValidID) => {
        const isEdit = !!validID.id
        try {
            const { data, error } = await supabase
                .from("req_valid_ids")
                .upsert([validID])
                .select()

            if (error) throw error

            const savedID = data?.[0] || validID
            let updatedIDs: ValidID[]
            if (isEdit) {
                updatedIDs = validIDs.map(v => v.id === validID.id ? savedID : v)
            } else {
                updatedIDs = [...validIDs, savedID]
            }
            setValidIDs(updatedIDs)
            localStorage.setItem(`req_valid_ids_${selectedPerson}`, JSON.stringify(updatedIDs))
        } catch (e) {
            console.warn("Failed to save Valid ID, saving locally:", e)
            const mockID = { ...validID, id: validID.id || Date.now() }
            let updatedIDs: ValidID[]
            if (isEdit) {
                updatedIDs = validIDs.map(v => v.id === validID.id ? mockID : v)
            } else {
                updatedIDs = [...validIDs, mockID]
            }
            setValidIDs(updatedIDs)
            localStorage.setItem(`req_valid_ids_${selectedPerson}`, JSON.stringify(updatedIDs))
        }
    }

    const handleDeleteValidID = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete Valid ID: ${name}?`)) return
        try {
            const { error } = await supabase
                .from("req_valid_ids")
                .delete()
                .eq("id", id)

            if (error) throw error

            const updatedIDs = validIDs.filter(v => v.id !== id)
            setValidIDs(updatedIDs)
            localStorage.setItem(`req_valid_ids_${selectedPerson}`, JSON.stringify(updatedIDs))
        } catch (e) {
            console.warn("Failed to delete Valid ID, removing locally:", e)
            const updatedIDs = validIDs.filter(v => v.id !== id)
            setValidIDs(updatedIDs)
            localStorage.setItem(`req_valid_ids_${selectedPerson}`, JSON.stringify(updatedIDs))
        }
    }

    // Certificates CRUD
    const handleSaveCertificate = async (cert: Certificate) => {
        const isEdit = !!cert.id
        try {
            const { data, error } = await supabase
                .from("req_certificates")
                .upsert([cert])
                .select()

            if (error) throw error

            const savedCert = data?.[0] || cert
            let updatedCerts: Certificate[]
            if (isEdit) {
                updatedCerts = certificates.map(c => c.id === cert.id ? savedCert : c)
            } else {
                updatedCerts = [...certificates, savedCert]
            }
            setCertificates(updatedCerts)
            localStorage.setItem(`req_certificates_${selectedPerson}`, JSON.stringify(updatedCerts))
        } catch (e) {
            console.warn("Failed to save Certificate, saving locally:", e)
            const mockCert = { ...cert, id: cert.id || Date.now() }
            let updatedCerts: Certificate[]
            if (isEdit) {
                updatedCerts = certificates.map(c => c.id === cert.id ? mockCert : c)
            } else {
                updatedCerts = [...certificates, mockCert]
            }
            setCertificates(updatedCerts)
            localStorage.setItem(`req_certificates_${selectedPerson}`, JSON.stringify(updatedCerts))
        }
    }

    const handleDeleteCertificate = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete Certificate: ${name}?`)) return
        try {
            const { error } = await supabase
                .from("req_certificates")
                .delete()
                .eq("id", id)

            if (error) throw error

            const updatedCerts = certificates.filter(c => c.id !== id)
            setCertificates(updatedCerts)
            localStorage.setItem(`req_certificates_${selectedPerson}`, JSON.stringify(updatedCerts))
        } catch (e) {
            console.warn("Failed to delete Certificate, removing locally:", e)
            const updatedCerts = certificates.filter(c => c.id !== id)
            setCertificates(updatedCerts)
            localStorage.setItem(`req_certificates_${selectedPerson}`, JSON.stringify(updatedCerts))
        }
    }

    const categories = ["All", "IDs & Clearances", "Birth & Baptism", "School & Credentials", "Employment & Contributions", "Photos", "Checklist", "Credentials", "Family"]

    const getCategoryCount = (category: string) => {
        if (category === "All") return documents.length
        if (category === "Checklist") return checklistItems.length
        if (category === "Credentials") return validIDs.length + certificates.length
        if (category === "Family") return familyMembers.length
        return documents.filter((doc) => doc.category === category).length
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
        return documents.find((doc) => {
            const normalizedDocName = doc.name.toLowerCase().replace(/[^a-z0-9]/g, "")
            return normalizedDocName.includes(normalizedNote) || normalizedNote.includes(normalizedDocName)
        })
    }

    const isDocumentView = selectedCategory !== "Checklist" && selectedCategory !== "Credentials" && selectedCategory !== "Family"


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

                    {/* Header Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        {isDocumentView && (
                            <>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-card border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-medium transition-colors text-foreground"
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
                            </>
                        )}

                        {/* Person Filter Selector */}
                        {selectedCategory !== "Family" && (
                            <div className="relative min-w-[180px]">
                                <select
                                    value={selectedPerson}
                                    onChange={(e) => setSelectedPerson(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 bg-card border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-bold transition-colors cursor-pointer appearance-none text-foreground"
                                >
                                    <option value="self">👤 Me (Harold)</option>
                                    {familyMembers.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            👥 {member.name} ({member.relationship})
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Show Sensitive Toggle */}
                        <button
                            onClick={() => setShowSensitive(!showSensitive)}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                                showSensitive
                                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            }`}
                        >
                            {showSensitive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {showSensitive ? "Hide Sensitive" : "Show Sensitive"}
                        </button>
                    </div>

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
                        isCredentialsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/40 rounded-3xl space-y-4 shadow-xl">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground font-semibold">Loading credentials...</p>
                            </div>
                        ) : (
                            <CredentialsView
                                showSensitive={showSensitive}
                                maskValue={maskValue}
                                validIDs={validIDs}
                                certificates={certificates}
                                onAddId={() => {
                                    setEditingValidID(null)
                                    setIsValidIDModalOpen(true)
                                }}
                                onEditId={(id) => {
                                    setEditingValidID(id)
                                    setIsValidIDModalOpen(true)
                                }}
                                onDeleteId={(id, name) => handleDeleteValidID(id, name)}
                                onAddCert={() => {
                                    setEditingCert(null)
                                    setIsCertModalOpen(true)
                                }}
                                onEditCert={(cert) => {
                                    setEditingCert(cert)
                                    setIsCertModalOpen(true)
                                }}
                                onDeleteCert={(id, name) => handleDeleteCertificate(id, name)}
                            />
                        )
                    ) : selectedCategory === "Family" ? (
                        <motion.div
                            key="family"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-8"
                        >
                            {isFamilyLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/40 rounded-3xl space-y-4">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground font-semibold">Synchronizing with Supabase database...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Parents' Marriage Anniversary banner */}
                                    <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-8 translate-x-8 pointer-events-none"></div>
                                        <div className="flex items-center gap-4.5 z-10">
                                            <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500">
                                                <Heart className="h-8 w-8 fill-rose-500 animate-pulse" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-xl font-bold tracking-tight">Parents' Marriage</h2>
                                                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border bg-rose-500/10 text-rose-500 border-rose-500/20">
                                                        Anniversary
                                                    </span>
                                                </div>
                                                {isEditingMarriageDate ? (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            value={marriageDateInput}
                                                            onChange={(e) => setMarriageDateInput(e.target.value)}
                                                            placeholder="November 26, 1995"
                                                            className="px-3 py-1 bg-background border border-border/60 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
                                                        />
                                                        <button
                                                            onClick={handleSaveMarriageDate}
                                                            className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                                            title="Save Date"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingMarriageDate(false)
                                                                setMarriageDateInput(marriageDate)
                                                            }}
                                                            className="p-1 rounded bg-stone-500/10 text-stone-400 hover:bg-stone-500/20 border border-stone-500/20 transition-all"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground font-medium mt-1">
                                                        Date of Marriage: <span className="text-foreground font-bold">{marriageDate}</span>
                                                        {(() => {
                                                            const years = getYearsOfMarriage(marriageDate)
                                                            if (years !== null) {
                                                                return (
                                                                    <span className="ml-2 text-xs text-rose-500 font-bold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                                                                        {years} Years of Love ❤️
                                                                    </span>
                                                                )
                                                            }
                                                            return null
                                                        })()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {!isEditingMarriageDate && (
                                            <button
                                                onClick={() => {
                                                    setIsEditingMarriageDate(true)
                                                    setMarriageDateInput(marriageDate)
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border/40 font-bold text-xs rounded-xl shadow-sm transition-all z-10"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span>Edit Marriage Date</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Family Members Header & Add Action */}
                                    <div className="flex items-center justify-between border-b border-border/30 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight">Family Members</h2>
                                                <p className="text-xs text-muted-foreground font-medium">Keep track of important family contact information and birthdays</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingMember(null)
                                                setFormName("")
                                                setFormRelationship("Sister")
                                                setFormBirthday("")
                                                setFormContact("")
                                                setIsFamilyModalOpen(true)
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Add Member</span>
                                        </button>
                                    </div>

                                    {/* Family Members Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {familyMembers.map((member) => {
                                            const age = calculateAge(member.birthday)
                                            const initials = member.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()

                                            const getGradient = (rel: typeof member.relationship) => {
                                                switch (rel) {
                                                    case "Mother":
                                                        return "from-rose-400 to-pink-600 dark:from-rose-500/20 dark:to-pink-600/30 text-rose-600 dark:text-rose-400"
                                                    case "Father":
                                                        return "from-sky-400 to-blue-600 dark:from-sky-500/20 dark:to-blue-600/30 text-blue-600 dark:text-blue-400"
                                                    case "Sister":
                                                        return "from-purple-400 to-indigo-600 dark:from-purple-500/20 dark:to-indigo-600/30 text-indigo-600 dark:text-indigo-400"
                                                    case "Brother":
                                                        return "from-amber-400 to-orange-600 dark:from-amber-500/20 dark:to-orange-600/30 text-orange-600 dark:text-orange-400"
                                                    default:
                                                        return "from-teal-400 to-emerald-600 dark:from-teal-500/20 dark:to-emerald-600/30 text-emerald-600 dark:text-emerald-400"
                                                }
                                            }

                                            const getBadge = (rel: typeof member.relationship) => {
                                                switch (rel) {
                                                    case "Mother":
                                                        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                    case "Father":
                                                        return "bg-sky-500/10 text-sky-500 border-sky-500/20"
                                                    case "Sister":
                                                        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                                    case "Brother":
                                                        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                    default:
                                                        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                }
                                            }

                                            return (
                                                <div 
                                                    key={member.id}
                                                    className="bg-card border border-border/40 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-primary/20 hover:shadow-2xl flex flex-col justify-between"
                                                >
                                                    <div className="space-y-4">
                                                        {/* Member Card Header */}
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex items-center gap-3.5">
                                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${getGradient(member.relationship)}`}>
                                                                    {initials}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-base text-foreground leading-snug break-words pr-12">
                                                                        {member.name}
                                                                    </h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border shrink-0 ${getBadge(member.relationship)}`}>
                                                                            {member.relationship}
                                                                        </span>
                                                                        {age !== null && (
                                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                                {age} years old
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex items-center gap-1.5 shrink-0 absolute top-4 right-4">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingMember(member)
                                                                        setFormName(member.name)
                                                                        setFormRelationship(member.relationship)
                                                                        setFormBirthday(member.birthday)
                                                                        setFormContact(member.contact)
                                                                        setIsFamilyModalOpen(true)
                                                                    }}
                                                                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                                                                    title="Edit Member"
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMember(member.id, member.name)}
                                                                    className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/80 hover:text-rose-500 transition-all border border-rose-500/10"
                                                                    title="Delete Member"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="border-t border-border/30 pt-4 space-y-2.5">
                                                            {/* Birthday */}
                                                            <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                                                                <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                                                                <span>Birthday: <strong className="text-foreground">{member.birthday}</strong></span>
                                                            </div>

                                                            {/* Contact */}
                                                            <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                                                                <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                                                                <span>
                                                                    Contact:{" "}
                                                                    <strong className="text-foreground font-mono">
                                                                        {maskValue(member.contact)}
                                                                    </strong>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {familyMembers.length === 0 && (
                                            <div className="col-span-full py-12 text-center bg-card border border-border/40 rounded-3xl">
                                                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                                <h3 className="font-bold text-lg">No family members</h3>
                                                <p className="text-muted-foreground text-sm mt-1">Add details of your family members to display them here.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : selectedCategory === "Checklist" ? (
                        <motion.div
                            key="checklist"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
                        >
                            {isChecklistLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground font-semibold">Loading checklist items...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between border-b border-border/30 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                <ClipboardList className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold tracking-tight">Status Checklist</h2>
                                                <p className="text-xs text-muted-foreground font-medium">Tracking file completions and outstanding tasks</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingChecklistItem(null)
                                                setIsChecklistModalOpen(true)
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Add Item</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {checklistItems.map((note) => (
                                            <div 
                                                key={note.id}
                                                className="flex items-start justify-between gap-3.5 p-4 bg-background border border-border/30 rounded-2xl transition-all hover:border-primary/20 hover:shadow-md relative group"
                                            >
                                                <div className="flex items-start gap-3.5 min-w-0 pr-16">
                                                    {getStatusIcon(note.status)}
                                                    <div className="space-y-1.5 min-w-0">
                                                        <h3 className="font-bold text-sm text-foreground leading-snug break-words">
                                                            {note.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 flex-wrap w-full">
                                                            {getStatusBadge(note.status)}
                                                            <span className="text-[11px] text-muted-foreground font-medium leading-none">
                                                                {note.status_text}
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
                                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors ml-2 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded border border-primary/10"
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

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingChecklistItem(note)
                                                            setIsChecklistModalOpen(true)
                                                        }}
                                                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                                                        title="Edit Item"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteChecklistItem(note.id!, note.title)}
                                                        className="p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-all border border-rose-500/10"
                                                        title="Delete Item"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {checklistItems.length === 0 && (
                                            <div className="col-span-full py-12 text-center">
                                                <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                                <h3 className="font-bold text-lg">No checklist items</h3>
                                                <p className="text-muted-foreground text-sm mt-1">Add items to track tasks and file completions.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-4"
                        >
                            {/* Document header with Add button */}
                            <div className="flex items-center justify-between bg-card border border-border/40 rounded-2xl px-6 py-4 shadow-sm">
                                <div>
                                    <h3 className="font-bold text-sm">Category: <span className="text-primary">{selectedCategory}</span></h3>
                                    <p className="text-xs text-muted-foreground">Manage your documents and preview files</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingDoc(null)
                                        setIsDocModalOpen(true)
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add Document</span>
                                </button>
                            </div>

                            {isDocsLoading ? (
                                <div className="bg-card border border-border/40 rounded-3xl py-20 flex flex-col items-center justify-center space-y-4 shadow-xl">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground font-semibold">Loading documents...</p>
                                </div>
                            ) : (
                                <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl">
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
                                                        <tr key={doc.id || doc.name} className="hover:bg-muted/50 transition-colors">
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
                                                                    {(doc.type === "pdf" || doc.type === "jpg" || doc.type === "png") ? (
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
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingDoc(doc)
                                                                            setIsDocModalOpen(true)
                                                                        }}
                                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground transition-all hover:scale-105"
                                                                        title="Edit Document"
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteDocument(doc.id!, doc.path, doc.name)}
                                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10 transition-all hover:scale-105 animate-pulse-hover"
                                                                        title="Delete Document"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
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
                                </div>
                            )}
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

                {/* Family Member Add/Edit Modal */}
                <AnimatePresence>
                    {isFamilyModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={() => setIsFamilyModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border/50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="px-6 py-4 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-foreground">
                                        {editingMember ? "Edit Family Member" : "Add Family Member"}
                                    </h3>
                                    <button
                                        onClick={() => setIsFamilyModalOpen(false)}
                                        className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Modal Body / Form */}
                                <form onSubmit={handleSaveMember} className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isFamilySaving}
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            placeholder="e.g. Luvy Molina Eugenio"
                                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Relationship</label>
                                        <select
                                            disabled={isFamilySaving}
                                            value={formRelationship}
                                            onChange={(e) => setFormRelationship(e.target.value as FamilyMember["relationship"])}
                                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60"
                                        >
                                            <option value="Mother">Mother</option>
                                            <option value="Father">Father</option>
                                            <option value="Sister">Sister</option>
                                            <option value="Brother">Brother</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Birthday</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isFamilySaving}
                                            value={formBirthday}
                                            onChange={(e) => setFormBirthday(e.target.value)}
                                            placeholder="e.g. February 01, 1975"
                                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Number</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isFamilySaving}
                                            value={formContact}
                                            onChange={(e) => setFormContact(e.target.value)}
                                            placeholder="e.g. 09164865929"
                                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors font-mono disabled:opacity-60"
                                        />
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-2.5">
                                        <button
                                            type="button"
                                            disabled={isFamilySaving}
                                            onClick={() => setIsFamilyModalOpen(false)}
                                            className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border/40 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isFamilySaving}
                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                                        >
                                            {isFamilySaving ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-3.5 w-3.5" />
                                                    <span>Save Member</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CRUD Modals */}
                <DocumentModal
                    isOpen={isDocModalOpen}
                    onClose={() => setIsDocModalOpen(false)}
                    onSave={handleSaveDocument}
                    editingDoc={editingDoc}
                    personId={selectedPerson}
                />

                <ChecklistModal
                    isOpen={isChecklistModalOpen}
                    onClose={() => setIsChecklistModalOpen(false)}
                    onSave={handleSaveChecklistItem}
                    editingItem={editingChecklistItem}
                    personId={selectedPerson}
                />

                <ValidIDModal
                    isOpen={isValidIDModalOpen}
                    onClose={() => setIsValidIDModalOpen(false)}
                    onSave={handleSaveValidID}
                    editingId={editingValidID}
                    personId={selectedPerson}
                />

                <CertificateModal
                    isOpen={isCertModalOpen}
                    onClose={() => setIsCertModalOpen(false)}
                    onSave={handleSaveCertificate}
                    editingCert={editingCert}
                    personId={selectedPerson}
                />
            </div>
        </div>
    )
}

// ── Credentials Tab Component ─────────────────────────────────────────
function CredentialsView({
    showSensitive,
    maskValue,
    validIDs,
    certificates,
    onAddId,
    onEditId,
    onDeleteId,
    onAddCert,
    onEditCert,
    onDeleteCert
}: {
    showSensitive: boolean
    maskValue: (v: string) => string
    validIDs: ValidID[]
    certificates: Certificate[]
    onAddId: () => void
    onEditId: (id: ValidID) => void
    onDeleteId: (id: number, name: string) => void
    onAddCert: () => void
    onEditCert: (cert: Certificate) => void
    onDeleteCert: (id: number, name: string) => void
}) {
    return (
        <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
        >
            {/* Valid IDs Table */}
            <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Valid IDs</h2>
                            <p className="text-xs text-muted-foreground font-medium">{validIDs.length} records — Government, bank, and personal identification</p>
                        </div>
                    </div>
                    <button
                        onClick={onAddId}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add ID</span>
                    </button>
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
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {validIDs.map((id) => (
                                <tr key={id.id || id.name} className="hover:bg-muted/50 transition-colors">
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
                                    <td className="px-4 py-3 font-mono text-xs text-foreground/80 whitespace-nowrap">{id.id_number}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.issued_date}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.expiration}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{id.date_created}</td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">
                                        <span className={!showSensitive && id.user_id !== "—" ? "select-none" : ""}>
                                            {maskValue(id.user_id)}
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
                                            {id.front_link && (
                                                <a href={id.front_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">
                                                    <ExternalLink className="h-3 w-3" /> Front
                                                </a>
                                            )}
                                            {id.back_link && (
                                                <a href={id.back_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-500/10 text-stone-400 text-[10px] font-bold hover:bg-stone-500/20 transition-colors">
                                                    <ExternalLink className="h-3 w-3" /> Back
                                                </a>
                                            )}
                                            {!id.front_link && !id.back_link && (
                                                <span className="text-[10px] text-muted-foreground/40 font-bold">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => onEditId(id)}
                                                className="p-1 rounded bg-muted hover:bg-muted/85 text-foreground transition-all"
                                                title="Edit ID"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteId(id.id!, id.name)}
                                                className="p-1 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-all border border-rose-500/10"
                                                title="Delete ID"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
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
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Certificates</h2>
                            <p className="text-xs text-muted-foreground font-medium">{certificates.length} records — Academic, employment, and government certifications</p>
                        </div>
                    </div>
                    <button
                        onClick={onAddCert}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Certificate</span>
                    </button>
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
                                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {certificates.map((cert) => (
                                <tr key={cert.id || cert.name} className="hover:bg-muted/50 transition-colors">
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
                                    <td className="px-4 py-3 font-mono text-xs text-foreground/80 whitespace-nowrap">{cert.id_number}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.issued_date}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.expiration}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{cert.date_created}</td>
                                    <td className="px-4 py-3 text-xs whitespace-nowrap font-mono">
                                        <span className={!showSensitive && cert.user_id !== "—" ? "select-none" : ""}>
                                            {maskValue(cert.user_id)}
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
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => onEditCert(cert)}
                                                className="p-1 rounded bg-muted hover:bg-muted/85 text-foreground transition-all"
                                                title="Edit Certificate"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteCert(cert.id!, cert.name)}
                                                className="p-1 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-all border border-rose-500/10"
                                                title="Delete Certificate"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
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
