import React, { useState, useEffect } from "react"
import { X, Save, Upload, Loader2, FileText, Calendar } from "lucide-react"
import type { ReqDocument } from "./types"
import { DOC_CATEGORIES } from "./types"
import { supabase } from "../../lib/supabase"

interface DocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (doc: ReqDocument) => Promise<void>
    editingDoc: ReqDocument | null
    personId: string
}

export default function DocumentModal({ isOpen, onClose, onSave, editingDoc, personId }: DocumentModalProps) {
    const [name, setName] = useState("")
    const [category, setCategory] = useState<ReqDocument["category"]>("IDs & Clearances")
    const [file, setFile] = useState<File | null>(null)
    const [path, setPath] = useState("")
    const [fileType, setFileType] = useState<ReqDocument["type"]>("pdf")
    const [size, setSize] = useState("")
    const [issuedDate, setIssuedDate] = useState("")
    const [expirationDate, setExpirationDate] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (editingDoc) {
            setName(editingDoc.name)
            setCategory(editingDoc.category)
            setPath(editingDoc.path)
            setFileType(editingDoc.type)
            setSize(editingDoc.size)
            setIssuedDate(editingDoc.issued_date || "")
            setExpirationDate(editingDoc.expiration_date || "")
            setFile(null)
        } else {
            setName("")
            setCategory("IDs & Clearances")
            setPath("")
            setFileType("pdf")
            setSize("")
            setIssuedDate("")
            setExpirationDate("")
            setFile(null)
        }
    }, [editingDoc, isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)
        
        // Auto-fill file size in readable format
        const bytes = selectedFile.size
        let formattedSize = ""
        if (bytes >= 1048576) {
            formattedSize = (bytes / 1048576).toFixed(2) + " MB"
        } else {
            formattedSize = (bytes / 1024).toFixed(1) + " KB"
        }
        setSize(formattedSize)

        // Detect type
        const extension = selectedFile.name.split(".").pop()?.toLowerCase() || ""
        let detectedType: ReqDocument["type"] = "pdf"
        if (["jpg", "jpeg", "png"].includes(extension)) {
            detectedType = "jpg"
        } else if (["xls", "xlsx"].includes(extension)) {
            detectedType = "xlsx"
        } else if (["doc", "docx"].includes(extension)) {
            detectedType = "docx"
        } else if (extension === "html") {
            detectedType = "html"
        }
        setFileType(detectedType)

        // Default name to file name without extension if name is empty
        if (!name) {
            const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name
            setName(baseName)
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        try {
            setIsSaving(true)
            let finalPath = path

            // Upload file if new one is selected
            if (file) {
                setIsUploading(true)
                const fileExt = file.name.split(".").pop()
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
                const uploadPath = `${personId}/${uniqueFileName}`

                const { error: uploadError } = await supabase.storage
                    .from("requirements")
                    .upload(uploadPath, file, {
                        cacheControl: "3600",
                        upsert: true
                    })

                if (uploadError) {
                    throw new Error(`File upload failed: ${uploadError.message}`)
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("requirements")
                    .getPublicUrl(uploadPath)
                
                finalPath = publicUrl
                setIsUploading(false)
            }

            if (!finalPath) {
                alert("Please select a file to upload.")
                setIsSaving(false)
                return
            }

            const docData: ReqDocument = {
                id: editingDoc?.id,
                person_id: personId,
                name: name.trim(),
                path: finalPath,
                category,
                type: fileType,
                size,
                issued_date: issuedDate.trim() || undefined,
                expiration_date: expirationDate.trim() || undefined
            }

            await onSave(docData)
            onClose()
        } catch (error: any) {
            console.error("Error saving document:", error)
            alert(error.message || "Failed to save document. Make sure the 'requirements' storage bucket is created and set to public.")
        } finally {
            setIsSaving(false)
            setIsUploading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border/50">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">
                        {editingDoc ? "Edit Document" : "Add Document"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Document Name</label>
                        <input
                            type="text"
                            required
                            disabled={isSaving}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Taiwan Work Contract (3-Year Term), Passport"
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                        <select
                            disabled={isSaving}
                            value={category}
                            onChange={(e) => setCategory(e.target.value as ReqDocument["category"])}
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                        >
                            {DOC_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Validity & Expiration Tracking */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-2xl border border-border/30">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-primary" /> Issued / Effective Date
                            </label>
                            <input
                                type="date"
                                disabled={isSaving}
                                value={issuedDate}
                                onChange={(e) => setIssuedDate(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-foreground"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-rose-500" /> Expiration / Renewal Date
                            </label>
                            <input
                                type="date"
                                disabled={isSaving}
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold text-foreground"
                            />
                        </div>
                    </div>

                    {/* File upload section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {editingDoc ? "Replace File (Optional)" : "Select File"}
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-border/60 border-dashed rounded-xl cursor-pointer hover:bg-muted/30 transition-all relative overflow-hidden bg-background">
                                <div className="flex flex-col items-center justify-center pt-4 pb-5">
                                    <Upload className="w-7 h-7 text-muted-foreground mb-1.5" />
                                    <p className="text-xs text-muted-foreground font-semibold">
                                        {file ? file.name : "Click to select a file"}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isSaving}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Existing path info (if editing) */}
                    {editingDoc && !file && (
                        <div className="p-3 bg-muted/40 rounded-xl border border-border/20 flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">Current path: {path}</span>
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={onClose}
                            className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border/40 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>{isUploading ? "Uploading file..." : "Saving..."}</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    <span>Save Document</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
