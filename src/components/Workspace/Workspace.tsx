import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, LayoutDashboard, Loader2 } from "lucide-react"
import { ApplicationTrackerInner } from "../Resume/ApplicationTracker"
import { CoverLetterModal } from "../Resume/CoverLetterModal"
import type { ApplicationEntry } from "../../data/applications"
import { supabase } from "../../lib/supabase"

export default function Workspace() {
    const [applications, setApplications] = useState<ApplicationEntry[]>([])
    const [selectedApp, setSelectedApp] = useState<ApplicationEntry | null>(null)
    const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Load from Supabase
    useEffect(() => {
        async function fetchApps() {
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select('*')
                    .order('dateSubmitted', { ascending: false })

                if (error) throw error
                if (data) setApplications(data)
            } catch (e) {
                console.error("Error fetching applications:", e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchApps()
    }, [])

    const handleGenerate = (app: ApplicationEntry) => {
        setSelectedApp(app)
        setIsCoverLetterOpen(true)
    }

    const handleSaveCoverLetter = async (id: string, coverLetter: string, contactInfo: any) => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({
                    coverLetter,
                    userName: contactInfo.uName,
                    userEmail: contactInfo.uEmail,
                    userPhone: contactInfo.uPhone,
                    userAddress: contactInfo.uAddress,
                    userPortfolio: contactInfo.uPortfolio
                })
                .eq('id', id)

            if (error) throw error

            setApplications(prev => prev.map(app =>
                app.id === id ? {
                    ...app,
                    coverLetter,
                    userName: contactInfo.uName,
                    userEmail: contactInfo.uEmail,
                    userPhone: contactInfo.uPhone,
                    userAddress: contactInfo.uAddress,
                    userPortfolio: contactInfo.uPortfolio
                } : app
            ))

            if (selectedApp?.id === id) {
                setSelectedApp(prev => prev ? {
                    ...prev,
                    coverLetter,
                    userName: contactInfo.uName,
                    userEmail: contactInfo.uEmail,
                    userPhone: contactInfo.uPhone,
                    userAddress: contactInfo.uAddress,
                    userPortfolio: contactInfo.uPortfolio
                } : null)
            }
        } catch (e) {
            console.error("Error saving cover letter:", e)
            alert("Failed to save to cloud. Check console.")
        }
    }

    // Proxy for setApplications to handle DB sync
    const syncApplications = async (newApps: ApplicationEntry[] | ((prev: ApplicationEntry[]) => ApplicationEntry[])) => {
        const updatedApps = typeof newApps === 'function' ? newApps(applications) : newApps

        // Find what changed (simplified: just upsert all for small lists, or handle single changes)
        // For now, we'll let ApplicationTracker handle its own state and we'll sync the whole thing or specific actions.
        // Optimization: Let's make ApplicationTracker call specific DB sync functions.
        setApplications(updatedApps)
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase flex items-center gap-4">
                                Career <span className="text-primary">Workspace</span>
                                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                            </h1>
                            <p className="text-muted-foreground font-medium max-w-xl">
                                Track your job applications and generate professional cover letters instantly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="min-h-[600px]"
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <LayoutDashboard className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Active Applications</h2>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/10 rounded-3xl shadow-xl">
                                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Connecting to Real Data...</p>
                            </div>
                        ) : (
                            <div className="bg-card border border-border/10 rounded-3xl overflow-hidden shadow-2xl">
                                <ApplicationTrackerInner
                                    onGenerate={handleGenerate}
                                    applications={applications}
                                    setApplications={syncApplications as any}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Integrated Cover Letter Modal */}
            <CoverLetterModal
                isOpen={isCoverLetterOpen}
                onClose={() => setIsCoverLetterOpen(false)}
                onSave={handleSaveCoverLetter}
                initialData={selectedApp ? {
                    id: selectedApp.id,
                    companyName: selectedApp.companyName,
                    companyAddress: selectedApp.companyAddress,
                    jobTitle: selectedApp.role,
                    coverLetter: selectedApp.coverLetter,
                    userName: selectedApp.userName,
                    userEmail: selectedApp.userEmail,
                    userPhone: selectedApp.userPhone,
                    userAddress: selectedApp.userAddress,
                    userPortfolio: selectedApp.userPortfolio
                } : undefined}
            />
        </div>
    )
}
