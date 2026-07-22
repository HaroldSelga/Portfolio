import React, { useState, useEffect } from "react"
import { X, Save, Loader2 } from "lucide-react"
import type { ChecklistItem } from "./types"
import { CHECKLIST_STATUSES } from "./types"

interface ChecklistModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (item: ChecklistItem) => Promise<void>
    editingItem: ChecklistItem | null
    personId: string
}

export default function ChecklistModal({ isOpen, onClose, onSave, editingItem, personId }: ChecklistModalProps) {
    const [title, setTitle] = useState("")
    const [status, setStatus] = useState<ChecklistItem["status"]>("claimed")
    const [statusText, setStatusText] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title)
            setStatus(editingItem.status)
            setStatusText(editingItem.status_text)
        } else {
            setTitle("")
            setStatus("claimed")
            setStatusText("")
        }
    }, [editingItem, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !statusText.trim()) return

        try {
            setIsSaving(true)
            const itemData: ChecklistItem = {
                id: editingItem?.id,
                person_id: personId,
                title: title.trim(),
                status,
                status_text: statusText.trim()
            }
            await onSave(itemData)
            onClose()
        } catch (error) {
            console.error("Error saving checklist item:", error)
            alert("Failed to save checklist item.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border/50">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">
                        {editingItem ? "Edit Checklist Item" : "Add Checklist Item"}
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
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item Name / Title</label>
                        <input
                            type="text"
                            required
                            disabled={isSaving}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. NBI Clearance, SSS ID Card"
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                        <select
                            disabled={isSaving}
                            value={status}
                            onChange={(e) => setStatus(e.target.value as ChecklistItem["status"])}
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                        >
                            {CHECKLIST_STATUSES.map((stat) => (
                                <option key={stat.value} value={stat.value}>{stat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Description / Remarks</label>
                        <input
                            type="text"
                            required
                            disabled={isSaving}
                            value={statusText}
                            onChange={(e) => setStatusText(e.target.value)}
                            placeholder="e.g. Printed / Printed na, To claim / Kukunin na lang"
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-2.5">
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
                                    <span>Save Item</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
