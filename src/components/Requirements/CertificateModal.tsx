import React, { useState, useEffect } from "react"
import { X, Save, Loader2, Upload, Link as LinkIcon } from "lucide-react"
import type { Certificate } from "./types"
import { supabase } from "../../lib/supabase"

interface CertificateModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (cert: Certificate) => Promise<void>
    editingCert: Certificate | null
    personId: string
}

export default function CertificateModal({ isOpen, onClose, onSave, editingCert, personId }: CertificateModalProps) {
    const [name, setName] = useState("")
    const [printed, setPrinted] = useState(false)
    const [idNumber, setIdNumber] = useState("—")
    const [issuedDate, setIssuedDate] = useState("—")
    const [expiration, setExpiration] = useState("—")
    const [dateCreated, setDateCreated] = useState("—")
    const [userId, setUserId] = useState("—")
    const [password, setPassword] = useState("—")
    const [remarks, setRemarks] = useState("—")
    const [link, setLink] = useState("")
    const [certFile, setCertFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (editingCert) {
            setName(editingCert.name)
            setPrinted(editingCert.printed)
            setIdNumber(editingCert.id_number)
            setIssuedDate(editingCert.issued_date)
            setExpiration(editingCert.expiration)
            setDateCreated(editingCert.date_created)
            setUserId(editingCert.user_id)
            setPassword(editingCert.password)
            setRemarks(editingCert.remarks)
            setLink(editingCert.link)
            setPreviewUrl(editingCert.link)
            setCertFile(null)
        } else {
            setName("")
            setPrinted(false)
            setIdNumber("—")
            setIssuedDate("—")
            setExpiration("—")
            setDateCreated("—")
            setUserId("—")
            setPassword("—")
            setRemarks("—")
            setLink("")
            setPreviewUrl("")
            setCertFile(null)
        }
    }, [editingCert, isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setCertFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const uploadCertFile = async (file: File): Promise<string> => {
        try {
            const ext = file.name.split(".").pop() || "jpg"
            const filename = `${personId}/cert_${Date.now()}.${ext}`
            const { error: uploadErr } = await supabase.storage.from("requirements").upload(filename, file, { upsert: true })
            if (!uploadErr) {
                const { data } = supabase.storage.from("requirements").getPublicUrl(filename)
                if (data?.publicUrl) return data.publicUrl
            }
        } catch (err) {
            console.warn("Storage upload fallback to data URL:", err)
        }

        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        try {
            setIsSaving(true)
            let finalLink = link

            if (certFile) {
                finalLink = await uploadCertFile(certFile)
            }

            const certData: Certificate = {
                id: editingCert?.id,
                person_id: personId,
                name: name.trim(),
                printed,
                id_number: idNumber.trim() || "—",
                issued_date: issuedDate.trim() || "—",
                expiration: expiration.trim() || "—",
                date_created: dateCreated.trim() || "—",
                user_id: userId.trim() || "—",
                password: password.trim() || "—",
                remarks: remarks.trim() || "—",
                link: finalLink.trim()
            }
            await onSave(certData)
            onClose()
        } catch (error) {
            console.error("Error saving Certificate:", error)
            alert("Failed to save Certificate.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border/50 my-8">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">
                        {editingCert ? "Edit Certificate" : "Add Certificate"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Certificate Name</label>
                            <input
                                type="text"
                                required
                                disabled={isSaving}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Diploma, NC II CSS"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-muted/20 border border-border/30 rounded-xl p-3 md:col-span-2">
                            <input
                                type="checkbox"
                                id="printed"
                                disabled={isSaving}
                                checked={printed}
                                onChange={(e) => setPrinted(e.target.checked)}
                                className="h-4.5 w-4.5 rounded border-border/60 focus:ring-primary cursor-pointer text-primary"
                            />
                            <label htmlFor="printed" className="text-sm font-bold text-foreground cursor-pointer select-none">
                                Printed (Physical Copy is Available)
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ID / Reference Number</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value)}
                                placeholder="e.g. CRT, 22034039109"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold font-mono transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Issued Date</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={issuedDate}
                                onChange={(e) => setIssuedDate(e.target.value)}
                                placeholder="e.g. June 1, 2021"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiration Date</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={expiration}
                                onChange={(e) => setExpiration(e.target.value)}
                                placeholder="e.g. May 31, 2026"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Date Created</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={dateCreated}
                                onChange={(e) => setDateCreated(e.target.value)}
                                placeholder="e.g. August 26, 2024"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User ID / Username</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Account email/username"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold font-mono transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Account password"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold font-mono transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Remarks / Notes</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Supervisor IT Jr."
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        {/* Certificate File Uploader & Link */}
                        <div className="space-y-1.5 md:col-span-2 border-t border-border/30 pt-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                <span>Certificate Image / File</span>
                                <span className="text-[10px] text-primary lowercase">Upload image file or link</span>
                            </label>

                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <label className="flex-1 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border/60 hover:border-primary rounded-xl cursor-pointer bg-background transition-all">
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {certFile ? certFile.name : "Upload Image File"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        disabled={isSaving}
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {previewUrl && (
                                    <div className="h-12 w-20 rounded-lg overflow-hidden border border-border/60 relative shrink-0 bg-muted/40 flex items-center justify-center">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="url"
                                    disabled={isSaving}
                                    value={link}
                                    onChange={(e) => {
                                        setLink(e.target.value)
                                        if (!certFile) setPreviewUrl(e.target.value)
                                    }}
                                    placeholder="Or paste image/Drive URL"
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold transition-colors disabled:opacity-60 text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-border/30">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={onClose}
                            className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border/40 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/15 hover:shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    <span>Save Certificate</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

