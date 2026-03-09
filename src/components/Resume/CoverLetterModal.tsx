import { useState, useMemo, useEffect } from "react"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Textarea } from "../ui/Textarea"
import { coverLetterData } from "../../data/coverLetter"
import { Copy, Printer, RotateCcw, Edit3, FileText, Save, CheckCircle2 } from "lucide-react"

interface CoverLetterModalProps {
    isOpen: boolean
    onClose: () => void
    onSave?: (id: string, coverLetter: string, contactInfo: any) => void
    initialData?: {
        id: string
        companyName: string
        companyAddress: string
        jobTitle: string
        coverLetter?: string
        userName?: string
        userEmail?: string
        userPhone?: string
        userAddress?: string
        userPortfolio?: string
    }
}

export function CoverLetterModal({ isOpen, onClose, onSave, initialData }: CoverLetterModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cover Letter Builder"
            className="max-w-7xl h-[95vh]"
        >
            <CoverLetterInner initialData={initialData} onSave={onSave} />
        </Modal>
    )
}

export function CoverLetterInner({ initialData, onSave }: {
    initialData?: CoverLetterModalProps['initialData'],
    onSave?: (id: string, coverLetter: string, contactInfo: any) => void
}) {
    // Always use today's date in a consistent format
    const getTodayDate = () => {
        return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

    const [isSaved, setIsSaved] = useState(false)
    const [formData, setFormData] = useState({
        date: getTodayDate(),
        hiringManager: 'Hiring Manager',
        companyName: initialData?.companyName || '[Company Name]',
        companyAddress: initialData?.companyAddress || '[Company Address]',
        jobTitle: initialData?.jobTitle || 'Full Stack Developer',
        body: initialData?.coverLetter || coverLetterData.template,
        // Dynamic Personal Info - load from initialData if exists, otherwise from global defaults
        uName: initialData?.userName || coverLetterData.name,
        uEmail: initialData?.userEmail || coverLetterData.email,
        uPhone: initialData?.userPhone || coverLetterData.phone,
        uAddress: initialData?.userAddress || coverLetterData.address,
        uPortfolio: initialData?.userPortfolio || coverLetterData.portfolioUrl
    })

    // Update form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                date: getTodayDate(),
                companyName: initialData.companyName,
                companyAddress: initialData.companyAddress,
                jobTitle: initialData.jobTitle,
                body: initialData.coverLetter || coverLetterData.template,
                uName: initialData.userName || coverLetterData.name,
                uEmail: initialData.userEmail || coverLetterData.email,
                uPhone: initialData.userPhone || coverLetterData.phone,
                uAddress: initialData.userAddress || coverLetterData.address,
                uPortfolio: initialData.userPortfolio || coverLetterData.portfolioUrl
            }))
        }
    }, [initialData])

    const processedLetter = useMemo(() => {
        let text = formData.body
        text = text.replace(/\[Date\]/g, formData.date)
        text = text.replace(/\[Hiring Manager's Name or "Hiring Team"\]/g, formData.hiringManager)
        text = text.replace(/\[Company Name\]/g, formData.companyName)
        text = text.replace(/\[Company Address or City\]/g, formData.companyAddress)
        text = text.replace(/\[Insert Job Title, e.g., Full Stack Developer\]/g, formData.jobTitle)
        text = text.replace(/\[Insert Company Name\]/g, formData.companyName)
        return text
    }, [formData])

    const handleCopy = () => {
        const fullLetter = `${coverLetterData.name}\n${coverLetterData.phone} | ${coverLetterData.email}\n${coverLetterData.portfolioUrl}\n\n${coverLetterData.address}\n\n${processedLetter}`
        navigator.clipboard.writeText(fullLetter)
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>Cover Letter - ${formData.uName}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; text-align: justify; }
                        h1 { font-size: 24px; margin-bottom: 5px; color: #000; text-transform: uppercase; }
                        .contact-info { font-size: 14px; color: #666; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                        .content { white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <h1>${formData.uName}</h1>
                    <div class="contact-info">
                        ${formData.uPhone} | ${formData.uEmail} | ${formData.uPortfolio}<br>
                        ${formData.uAddress}
                    </div>
                    <div class="content">${processedLetter}</div>
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    const handleSave = () => {
        if (initialData?.id && onSave) {
            onSave(initialData.id, formData.body, formData)
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 2000)
        }
    }

    const handleReset = () => {
        if (confirm("Reset to original template?")) {
            setFormData({
                ...formData,
                body: coverLetterData.template
            })
        }
    }

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-border/10 bg-muted/20 gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20">
                        <Edit3 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Live Builder</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset} title="Reset Template">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 flex-1 md:flex-none">
                        <Copy className="h-4 w-4" />
                        Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 flex-1 md:flex-none">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Button
                        onClick={handleSave}
                        size="sm"
                        className={cn(
                            "gap-2 transition-all duration-300 flex-1 md:flex-none",
                            isSaved ? "bg-green-500 hover:bg-green-600" : "bg-primary"
                        )}
                    >
                        {isSaved ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save to App
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Editor Panel - Scrollable */}
                <div className="w-full lg:w-[400px] xl:w-[450px] p-6 border-r border-border/10 overflow-y-auto space-y-6 bg-muted/5 min-h-[300px] lg:min-h-0 border-b lg:border-b-0">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Variables
                        </h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Date</label>
                                    <Input
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="h-9 text-xs bg-card"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Hiring Manager</label>
                                    <Input
                                        value={formData.hiringManager}
                                        onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                                        className="h-9 text-xs bg-card"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Your Info</h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Full Name</label>
                                        <Input
                                            value={formData.uName}
                                            onChange={(e) => setFormData({ ...formData, uName: e.target.value })}
                                            className="h-8 text-[11px] bg-card"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Email</label>
                                        <Input
                                            value={formData.uEmail}
                                            onChange={(e) => setFormData({ ...formData, uEmail: e.target.value })}
                                            className="h-8 text-[11px] bg-card"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Phone</label>
                                        <Input
                                            value={formData.uPhone}
                                            onChange={(e) => setFormData({ ...formData, uPhone: e.target.value })}
                                            className="h-8 text-[11px] bg-card"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Address</label>
                                        <Input
                                            value={formData.uAddress}
                                            onChange={(e) => setFormData({ ...formData, uAddress: e.target.value })}
                                            className="h-8 text-[11px] bg-card"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Letter Content
                        </h4>
                        <Textarea
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            className="min-h-[500px] text-sm leading-relaxed font-mono bg-card resize-none p-4"
                        />
                        <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                            <p className="text-[10px] text-orange-600 dark:text-orange-400 leading-relaxed italic">
                                <strong>Tip:</strong> Use [Date], [Company Name], and [Job Title] tags for auto-replacement in the preview.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Panel - Scrollable */}
                <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto bg-muted/10">
                    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-sm p-8 md:p-16 border border-border/20 min-h-[11in]">
                        {/* Header */}
                        <div className="mb-12 border-b-2 border-primary/20 pb-8">
                            <h1 className="text-3xl font-black tracking-tight text-foreground mb-4 uppercase">{formData.uName}</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3 w-3 text-primary" />
                                        {formData.uPhone}
                                    </div>
                                    <div>{formData.uEmail}</div>
                                </div>
                                <div className="space-y-1 sm:text-right">
                                    <div>{formData.uAddress}</div>
                                    <div className="text-primary">{formData.uPortfolio}</div>
                                </div>
                            </div>
                        </div>

                        {/* Letter Content */}
                        <div className="text-foreground/90 leading-[1.8] text-[14px] whitespace-pre-wrap font-medium">
                            {processedLetter}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ")
}
