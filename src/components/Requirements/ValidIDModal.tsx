import React, { useState, useEffect } from "react"
import { X, Save, Loader2 } from "lucide-react"
import type { ValidID } from "./types"

interface ValidIDModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: ValidID) => Promise<void>
    editingId: ValidID | null
    personId: string
}

export default function ValidIDModal({ isOpen, onClose, onSave, editingId, personId }: ValidIDModalProps) {
    const [name, setName] = useState("")
    const [printed, setPrinted] = useState(false)
    const [idNumber, setIdNumber] = useState("—")
    const [issuedDate, setIssuedDate] = useState("—")
    const [expiration, setExpiration] = useState("—")
    const [dateCreated, setDateCreated] = useState("—")
    const [userId, setUserId] = useState("—")
    const [password, setPassword] = useState("—")
    const [remarks, setRemarks] = useState("—")
    const [frontLink, setFrontLink] = useState("")
    const [backLink, setBackLink] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (editingId) {
            setName(editingId.name)
            setPrinted(editingId.printed)
            setIdNumber(editingId.id_number)
            setIssuedDate(editingId.issued_date)
            setExpiration(editingId.expiration)
            setDateCreated(editingId.date_created)
            setUserId(editingId.user_id)
            setPassword(editingId.password)
            setRemarks(editingId.remarks)
            setFrontLink(editingId.front_link)
            setBackLink(editingId.back_link)
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
            setFrontLink("")
            setBackLink("")
        }
    }, [editingId, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        try {
            setIsSaving(true)
            const idData: ValidID = {
                id: editingId?.id,
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
                front_link: frontLink.trim(),
                back_link: backLink.trim()
            }
            await onSave(idData)
            onClose()
        } catch (error) {
            console.error("Error saving Valid ID:", error)
            alert("Failed to save Valid ID.")
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
                        {editingId ? "Edit Valid ID" : "Add Valid ID"}
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
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ID / Card Name</label>
                            <input
                                type="text"
                                required
                                disabled={isSaving}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. SSS UMID, National ID"
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
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ID / Card Number</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value)}
                                placeholder="e.g. 02-4734797-9"
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
                                placeholder="e.g. July 21, 2025"
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
                                placeholder="e.g. March 18, 2030"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Year Created</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={dateCreated}
                                onChange={(e) => setDateCreated(e.target.value)}
                                placeholder="e.g. 2024"
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
                                placeholder="e.g. Condition: C05"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Front Scan URL</label>
                            <input
                                type="url"
                                disabled={isSaving}
                                value={frontLink}
                                onChange={(e) => setFrontLink(e.target.value)}
                                placeholder="Google Drive Link for Front Side"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Back Scan URL</label>
                            <input
                                type="url"
                                disabled={isSaving}
                                value={backLink}
                                onChange={(e) => setBackLink(e.target.value)}
                                placeholder="Google Drive Link for Back Side"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
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
                                    <span>Save ID</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
