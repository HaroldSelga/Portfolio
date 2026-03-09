import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Textarea } from "../ui/Textarea"
import { Plus, Trash2, Edit2, Search, Building2, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Save, FileText, Ghost, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ApplicationEntry } from "../../data/applications"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

export function ApplicationTracker({ onGenerate, applications, setApplications }: ApplicationTrackerInnerProps) {
    return (
        <ApplicationTrackerInner onGenerate={onGenerate} applications={applications} setApplications={setApplications} />
    )
}

interface ApplicationTrackerInnerProps {
    onGenerate: (app: ApplicationEntry) => void
    applications: ApplicationEntry[]
    setApplications: React.Dispatch<React.SetStateAction<ApplicationEntry[]>>
}

export function ApplicationTrackerInner({ onGenerate, applications, setApplications }: ApplicationTrackerInnerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddingMode, setIsAddingMode] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Omit<ApplicationEntry, 'id'>>({
        companyName: "",
        companyAddress: "",
        role: "",
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: "Pending",
        notes: "",
        coverLetter: ""
    })

    const handleSave = async () => {
        if (!formData.companyName || !formData.role) return
        setIsSaving(true)

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('applications')
                    .update(formData)
                    .eq('id', editingId)

                if (error) throw error

                setApplications(prev => prev.map(app =>
                    app.id === editingId ? { ...formData, id: editingId } : app
                ))
                setEditingId(null)
            } else {
                const { data, error } = await supabase
                    .from('applications')
                    .insert([formData])
                    .select()

                if (error) throw error
                if (data) setApplications(prev => [data[0], ...prev])
            }

            setIsAddingMode(false)
            setFormData({
                companyName: "",
                companyAddress: "",
                role: "",
                dateSubmitted: new Date().toISOString().split('T')[0],
                status: "Pending",
                notes: "",
                coverLetter: ""
            })
        } catch (e) {
            console.error("Error saving submission:", e)
            alert("Failed to save to cloud. Ensure you have run the SQL setup in Supabase.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            try {
                const { error } = await supabase
                    .from('applications')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                setApplications(prev => prev.filter(app => app.id !== id))
            } catch (e) {
                console.error("Error deleting submission:", e)
                alert("Failed to delete from cloud.")
            }
        }
    }

    const handleEdit = (app: ApplicationEntry) => {
        setFormData({
            companyName: app.companyName,
            companyAddress: app.companyAddress,
            role: app.role,
            dateSubmitted: app.dateSubmitted,
            status: app.status,
            notes: app.notes,
            coverLetter: app.coverLetter || ""
        })
        setEditingId(app.id)
        setIsAddingMode(true)
    }

    const filteredApps = applications.filter(app =>
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusIcon = (status: ApplicationEntry['status']) => {
        switch (status) {
            case 'Accepted': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'Rejected': return <XCircle className="h-4 w-4 text-red-500" />
            case 'Interviewing': return <Clock className="h-4 w-4 text-blue-500" />
            case 'Followed Up': return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'Ghosted': return <Ghost className="h-4 w-4 text-gray-500" />
            default: return <Clock className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <div className="flex flex-col h-full bg-background min-h-[600px]">
            {/* Header Actions */}
            <div className="p-6 border-b border-border/10 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search company or role..."
                        className="pl-10 h-11 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => {
                        setIsAddingMode(true)
                        setEditingId(null)
                        setFormData({
                            companyName: "",
                            companyAddress: "",
                            role: "",
                            dateSubmitted: new Date().toISOString().split('T')[0],
                            status: "Pending",
                            notes: "",
                            coverLetter: "" // Ensure coverLetter is reset
                        })
                    }}
                    className="gap-2 bg-primary shadow-lg shadow-primary/20 h-11"
                >
                    <Plus className="h-4 w-4" />
                    Log New Submission
                </Button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Main List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[700px]">
                    <AnimatePresence mode="popLayout">
                        {filteredApps.map((app) => (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group relative shadow-sm hover:shadow-md"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <h4 className="font-black text-lg tracking-tight uppercase">{app.companyName}</h4>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-widest">
                                                {getStatusIcon(app.status)}
                                                {app.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Save className="h-3 w-3" /> {app.role}</span>
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {app.dateSubmitted}</span>
                                        </div>
                                        {app.notes && (
                                            <p className="text-sm text-muted-foreground/80 italic line-clamp-2 md:line-clamp-none">
                                                "{app.notes}"
                                            </p>
                                        )}
                                        <div className="pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-2 text-[10px] font-black uppercase tracking-widest border-orange-500/20 text-orange-500 hover:bg-orange-500/10 hover:text-orange-600"
                                                onClick={() => onGenerate(app)}
                                            >
                                                <FileText className="h-3 w-3" />
                                                Generate Cover Letter
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(app)}
                                            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(app.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredApps.length === 0 && (
                        <div className="text-center py-20 bg-muted/5 rounded-3xl border-2 border-dashed border-border/20">
                            <Building2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No entries found</p>
                        </div>
                    )}
                </div>

                {/* Side Editor (Conditional) */}
                <AnimatePresence>
                    {isAddingMode && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="w-full lg:w-[400px] border-l border-border/10 bg-muted/5 pb-12 overflow-y-auto max-h-[700px]"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                                        {editingId ? "Edit Submission" : "Log Submission"}
                                    </h4>
                                    <button
                                        onClick={() => setIsAddingMode(false)}
                                        className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Company Name</label>
                                        <Input
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            placeholder="e.g. Google, Meta"
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Company Address</label>
                                        <Input
                                            value={formData.companyAddress}
                                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                            placeholder="e.g. Mountain View, CA or Remote"
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Role</label>
                                        <Input
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            placeholder="e.g. Full Stack Developer"
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</label>
                                            <Input
                                                type="date"
                                                value={formData.dateSubmitted}
                                                onChange={(e) => setFormData({ ...formData, dateSubmitted: e.target.value })}
                                                className="bg-background px-2"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                                            <select
                                                className="w-full h-10 px-3 rounded-md bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Interviewing">Interviewing</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Followed Up">Followed Up</option>
                                                <option value="Ghosted">Ghosted</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notes</label>
                                        <Textarea
                                            className="min-h-[100px] bg-background"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Mentioned local payment gateways..."
                                        />
                                    </div>

                                    <Button
                                        className="w-full gap-2 font-bold h-12"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                {editingId ? "Update Entry" : "Save Entry"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
