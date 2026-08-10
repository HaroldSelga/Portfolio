import React, { useState, useEffect } from "react"
import { X, Save, Loader2, Calendar, Plus } from "lucide-react"
import type { DateTrackerItem } from "./types"
import { EVENT_TYPES } from "./types"

interface DateTrackerModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (item: DateTrackerItem) => Promise<void>
    editingItem: DateTrackerItem | null
    personId: string
}

export default function DateTrackerModal({ isOpen, onClose, onSave, editingItem, personId }: DateTrackerModalProps) {
    const [title, setTitle] = useState("")
    const [eventType, setEventType] = useState<string>("birthday")
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [customCategoryInput, setCustomCategoryInput] = useState("")
    const [date, setDate] = useState("")
    const [personName, setPersonName] = useState("")
    const [notes, setNotes] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title)
            const matchedPreset = EVENT_TYPES.find(t => t.value === editingItem.event_type)
            if (matchedPreset) {
                setEventType(editingItem.event_type)
                setIsCustomCategory(false)
                setCustomCategoryInput("")
            } else {
                setEventType("custom")
                setIsCustomCategory(true)
                setCustomCategoryInput(editingItem.event_type)
            }
            setDate(editingItem.date)
            setPersonName(editingItem.person_name || "")
            setNotes(editingItem.notes || "")
        } else {
            setTitle("")
            setEventType("birthday")
            setIsCustomCategory(false)
            setCustomCategoryInput("")
            setDate("")
            setPersonName("")
            setNotes("")
        }
    }, [editingItem, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !date) return

        const finalEventType = isCustomCategory
            ? (customCategoryInput.trim() || "other")
            : eventType

        try {
            setIsSaving(true)
            const itemData: DateTrackerItem = {
                id: editingItem?.id || `dt-${Date.now()}`,
                person_id: personId,
                title: title.trim(),
                event_type: finalEventType,
                date,
                person_name: personName.trim() || undefined,
                notes: notes.trim() || undefined
            }
            await onSave(itemData)
            onClose()
        } catch (error) {
            console.error("Error saving date tracker item:", error)
            alert("Failed to save date tracker item.")
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border/50">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-muted/50 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">
                            {editingItem ? "Edit Date Tracker" : "Add Date Tracker"}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Dynamic Event Category */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Category</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCustomCategory(!isCustomCategory)
                                    if (!isCustomCategory) setCustomCategoryInput("")
                                }}
                                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" />
                                {isCustomCategory ? "Choose Preset" : "Custom Category"}
                            </button>
                        </div>

                        {!isCustomCategory ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {EVENT_TYPES.map((type) => {
                                    const isSelected = eventType === type.value
                                    return (
                                        <button
                                            type="button"
                                            key={type.value}
                                            onClick={() => {
                                                if (type.value === "other") {
                                                    setIsCustomCategory(true)
                                                    setCustomCategoryInput("")
                                                } else {
                                                    setEventType(type.value)
                                                }
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 justify-center ${
                                                isSelected
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                    : "bg-background border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <span>{type.emoji}</span>
                                            <span className="truncate">{type.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <input
                                type="text"
                                required
                                disabled={isSaving}
                                value={customCategoryInput}
                                onChange={(e) => setCustomCategoryInput(e.target.value)}
                                placeholder="e.g. Work Anniversary, Pet Birthday, Graduation"
                                className="w-full px-4 py-2.5 bg-background border border-primary/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tracker Title</label>
                        <input
                            type="text"
                            required
                            disabled={isSaving}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Mom's Birthday, Parents' Anniversary, Couple Anniversary"
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                        />
                    </div>

                    {/* Date Picker & Person Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Date</label>
                            <input
                                type="date"
                                required
                                disabled={isSaving}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Person / Couple Name</label>
                            <input
                                type="text"
                                disabled={isSaving}
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                placeholder="e.g. Luvy Molina Eugenio, Mom & Dad"
                                className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold transition-colors disabled:opacity-60 text-foreground"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes / Celebration Details</label>
                        <textarea
                            disabled={isSaving}
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Planning a dinner surprise, milestone gift..."
                            className="w-full px-4 py-2.5 bg-background border border-border/60 rounded-xl focus:outline-none focus:border-primary text-sm font-medium transition-colors disabled:opacity-60 text-foreground resize-none"
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground font-bold text-xs transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span>{editingItem ? "Update Tracker" : "Save Tracker"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
