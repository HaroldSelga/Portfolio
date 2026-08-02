import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, TrendingDown, X, AlertCircle, Sparkles, Camera, FileText, Check, Upload, ArrowRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { FinanceEntry, Wallet, CategoryBudget, CurrencyCode } from "./types"
import { EXPENSE_CATEGORIES, CURRENCIES, formatCurrency, getLocalDateString, getDefaultSmartWallet } from "./types"

interface ExpenseSectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    budgets: CategoryBudget[]
    showAmounts?: boolean
    baseCurrency?: CurrencyCode
    onAdd: (entry: Omit<FinanceEntry, "id" | "created_at">) => void
    onDelete: (id: string) => void
}

// Receipt Text Parser Helper
export function parseReceiptText(text: string) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
    
    // Known store patterns
    const knownStores: Record<string, string> = {
        "7-eleven": "food",
        "711": "food",
        "carrefour": "groceries",
        "px mart": "groceries",
        "pxmart": "groceries",
        "costco": "groceries",
        "supermarket": "groceries",
        "mcdonald": "food",
        "starbucks": "food",
        "kfc": "food",
        "jollibee": "food",
        "shell": "gas_fuel",
        "petron": "gas_fuel",
        "caltex": "gas_fuel",
        "uniqlo": "clothing",
        "shopee": "shopping",
        "lazada": "shopping",
        "taiwan power": "bills",
        "water": "bills",
        "eec": "remittance",
    }

    let storeName = "Scanned Receipt"
    let detectedCategory = "food"
    const lowerText = text.toLowerCase()
    
    for (const [kw, cat] of Object.entries(knownStores)) {
        if (lowerText.includes(kw)) {
            detectedCategory = cat
            const matchLine = lines.find(l => l.toLowerCase().includes(kw))
            if (matchLine) storeName = matchLine
            break
        }
    }

    if (storeName === "Scanned Receipt" && lines.length > 0) {
        const cleanFirst = lines.find(l => /[a-zA-Z]/.test(l) && l.length > 3 && !l.toLowerCase().includes("total"))
        if (cleanFirst) storeName = cleanFirst
    }

    // Detect Amount (look for TOTAL, SUM, NT$, ₱, $, or numbers)
    let amount = ""
    const priceRegex = /(?:total|amount|sum|nt\$|₱|\$)\s*[:=]?\s*([0-9]+(?:[.,][0-9]{1,2})?)/i
    const match = text.match(priceRegex)
    
    if (match && match[1]) {
        amount = match[1].replace(",", ".")
    } else {
        const numbers = text.match(/\b\d+(?:[.,]\d{2})?\b/g)
        if (numbers) {
            const parsed = numbers.map(n => parseFloat(n.replace(",", "."))).filter(n => n > 0 && n < 100000)
            if (parsed.length > 0) amount = String(Math.max(...parsed))
        }
    }

    // Detect Date
    let date = getLocalDateString()
    const dateRegex = /\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/
    const dateMatch = text.match(dateRegex)
    if (dateMatch && dateMatch[1]) {
        date = dateMatch[1].replace(/[/.]/g, "-")
    }

    return { amount, description: storeName, category: detectedCategory, date }
}

export function ExpenseSection({
    entries,
    wallets,
    budgets,
    showAmounts = true,
    baseCurrency = "PHP",
    onAdd,
    onDelete
}: ExpenseSectionProps) {
    const [showForm, setShowForm] = useState(false)
    const [showScanModal, setShowScanModal] = useState(false)
    const [scannedImage, setScannedImage] = useState<string | null>(null)
    const [ocrInputText, setOcrInputText] = useState("")
    const [extractedData, setExtractedData] = useState<{
        amount: string
        description: string
        category: string
        date: string
    } | null>(null)

    const [formData, setFormData] = useState({
        date: getLocalDateString(),
        category: "food",
        description: "",
        amount: "",
        wallet_id: getDefaultSmartWallet(wallets),
        notes: "",
    })

    useEffect(() => {
        if (!formData.wallet_id && wallets.length > 0) {
            setFormData(prev => ({ ...prev, wallet_id: getDefaultSmartWallet(wallets) }))
        }
    }, [wallets, formData.wallet_id])

    const activeWalletId = formData.wallet_id || wallets[0]?.id || ""
    const selectedWallet = wallets.find(w => w.id === activeWalletId)
    const walletCurrency: CurrencyCode = selectedWallet?.currency || "PHP"
    const currInfo = CURRENCIES[walletCurrency] || CURRENCIES.PHP

    const currentMonthPrefix = useMemo(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    }, [])

    // Calculate current spending for a specific category this month
    const getCategorySpentThisMonth = useCallback((category: string) => {
        return entries
            .filter(e => e.type === "expense" && e.category === category && e.date.startsWith(currentMonthPrefix))
            .reduce((sum, e) => sum + e.amount, 0)
    }, [entries, currentMonthPrefix])

    // Active budget warning for selected category in the form
    const activeBudget = useMemo(() => {
        const budget = budgets.find(b => b.category === formData.category)
        if (!budget) return null

        const spent = getCategorySpentThisMonth(formData.category)
        const currentAmount = parseFloat(formData.amount || "0")
        const totalProjected = spent + currentAmount
        const limit = budget.limit_amount
        const percentUsed = limit > 0 ? (totalProjected / limit) * 100 : 0

        return {
            limit,
            spent,
            totalProjected,
            percentUsed,
            isOver: totalProjected > limit,
            isNear: totalProjected >= limit * 0.8 && totalProjected <= limit,
        }
    }, [formData.category, formData.amount, budgets, getCategorySpentThisMonth])

    // List of budgets that are close to or exceeding limits
    const budgetAlerts = useMemo(() => {
        return budgets.map(budget => {
            const spent = getCategorySpentThisMonth(budget.category)
            const percent = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0
            const catInfo = EXPENSE_CATEGORIES.find(c => c.value === budget.category)
            return { budget, spent, percent, catInfo }
        }).filter(item => item.percent >= 80)
    }, [budgets, getCategorySpentThisMonth])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const targetWalletId = activeWalletId
        if (!formData.amount || !targetWalletId) return

        onAdd({
            type: "expense",
            date: formData.date,
            category: formData.category,
            description: formData.description || EXPENSE_CATEGORIES.find(c => c.value === formData.category)?.label || "Expense",
            amount: parseFloat(formData.amount),
            wallet_id: targetWalletId,
            currency: walletCurrency,
            notes: formData.notes || undefined,
        })

        setFormData({
            date: getLocalDateString(),
            category: "food",
            description: "",
            amount: "",
            wallet_id: getDefaultSmartWallet(wallets),
            notes: "",
        })
        setShowForm(false)
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const imgUrl = URL.createObjectURL(file)
        setScannedImage(imgUrl)

        const parsed = parseReceiptText(file.name.replace(/[-_.]/g, " "))
        setExtractedData(parsed)
    }

    const expenseEntries = entries.filter(e => e.type === "expense").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 rounded-xl">
                        <TrendingDown className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Expenses</h3>
                        <p className="text-xs font-bold text-muted-foreground hidden sm:block">
                            Track daily spending, food, bills, and monthly category budgets
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowScanModal(true)}
                        className="font-bold rounded-xl gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30"
                        size="sm"
                    >
                        <Camera className="h-4 w-4" />
                        Scan Receipt
                    </Button>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className={cn(
                            "font-bold rounded-xl gap-2 transition-all",
                            showForm
                                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                : "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                        )}
                        size="sm"
                    >
                        {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {showForm ? "Cancel" : "Add Expense"}
                    </Button>
                </div>
            </div>

            {/* Monthly Budget Warnings Panel */}
            {budgetAlerts.length > 0 && (
                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3.5 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500" /> Budget Warnings (This Month)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {budgetAlerts.map(({ budget, spent, percent, catInfo }) => {
                            const isExceeded = spent > budget.limit_amount
                            return (
                                <div
                                    key={budget.id}
                                    className={cn(
                                        "p-3 rounded-xl border flex flex-col justify-between gap-2 text-xs",
                                        isExceeded
                                            ? "bg-rose-500/5 border-rose-500/20 text-rose-500"
                                            : "bg-amber-500/5 border-amber-500/20 text-amber-500"
                                    )}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-black uppercase tracking-tight">
                                            {catInfo?.emoji} {catInfo?.label}
                                        </span>
                                        <span className="font-black tabular-nums">
                                            {Math.round(percent)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full", isExceeded ? "bg-rose-500" : "bg-amber-500")}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                        <span>Spent: {formatCurrency(spent, baseCurrency, showAmounts)}</span>
                                        <span>Limit: {formatCurrency(budget.limit_amount, baseCurrency, showAmounts)}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Add Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit}
                        className="overflow-hidden"
                    >
                        <div className="bg-card/60 backdrop-blur-sm border border-rose-500/20 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    >
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Amount ({currInfo.symbol} {walletCurrency})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0.000001"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Pay From Wallet</label>
                                    <select
                                        value={activeWalletId}
                                        onChange={e => setFormData({ ...formData, wallet_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    >
                                        {wallets.map(w => {
                                            const wCurr = w.currency || "PHP"
                                            const flag = CURRENCIES[wCurr]?.flag || "🇵🇭"
                                            const balStr = formatCurrency(w.balance, wCurr, showAmounts)
                                            return (
                                                <option key={w.id} value={w.id}>
                                                    {flag} {w.name} ({balStr})
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grab ride to work, Lunch with team"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes / Memo (optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Additional memo, receipt details..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                            </div>

                            {/* Dynamic Budget Alert within Form */}
                            {activeBudget && (
                                <div
                                    className={cn(
                                        "p-3 rounded-xl border flex items-center justify-between text-xs gap-3",
                                        activeBudget.isOver
                                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                            : activeBudget.isNear
                                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                    )}
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center font-bold mb-1">
                                            <span className="flex items-center gap-1">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Monthly Budget Progress
                                            </span>
                                            <span>
                                                {formatCurrency(activeBudget.totalProjected, baseCurrency, showAmounts)} / {formatCurrency(activeBudget.limit, baseCurrency, showAmounts)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full",
                                                    activeBudget.isOver ? "bg-rose-500" : activeBudget.isNear ? "bg-amber-500" : "bg-emerald-500"
                                                )}
                                                style={{ width: `${Math.min(activeBudget.percentUsed, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right font-black text-sm">
                                        {Math.round(activeBudget.percentUsed)}%
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl shadow-lg shadow-rose-500/20"
                            >
                                Add Expense
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Entries List */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden">
                {expenseEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <TrendingDown className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-bold text-muted-foreground">No expenses yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Your expense records will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {expenseEntries.map((entry, i) => {
                            const cat = EXPENSE_CATEGORIES.find(c => c.value === entry.category)
                            const wallet = wallets.find(w => w.id === entry.wallet_id)
                            const entryCurrency = entry.currency || wallet?.currency || "PHP"

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-muted/30 transition-colors group"
                                >
                                    <span className="text-lg">{cat?.emoji || "📦"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{entry.description || cat?.label || "Expense"}</p>
                                        {entry.notes && (
                                            <p className="text-xs text-muted-foreground/80 italic font-normal truncate">{entry.notes}</p>
                                        )}
                                        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                                            <span className="text-[11px]">{new Date(entry.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                                            <span className="hidden sm:inline">·</span>
                                            <span className="px-1.5 py-0.5 bg-muted rounded-md text-[10px] font-bold uppercase hidden sm:inline">
                                                {cat?.label || entry.category}
                                            </span>
                                            {wallet && (
                                                <>
                                                    <span>·</span>
                                                    <span className="font-semibold text-foreground/80">{wallet.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-black tabular-nums text-rose-500 shrink-0 ml-1">
                                        -{formatCurrency(entry.amount, entryCurrency, showAmounts)}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this expense entry?")) {
                                                onDelete(entry.id)
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove entry"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* 📷 AI RECEIPT SCANNER MODAL */}
            <Modal
                isOpen={showScanModal}
                onClose={() => {
                    setShowScanModal(false)
                    setScannedImage(null)
                    setExtractedData(null)
                    setOcrInputText("")
                }}
                title="📷 AI Receipt Scanner"
            >
                <div className="space-y-4">
                    <p className="text-xs text-muted-foreground font-medium">
                        Upload or take a photo of your receipt (7-Eleven, Carrefour, PX Mart, Restaurant, Gas Station) to auto-extract amount & category!
                    </p>

                    {/* Image Upload Zone */}
                    <div className="border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl p-6 text-center space-y-3 bg-muted/20 transition-all">
                        {scannedImage ? (
                            <div className="space-y-3">
                                <img src={scannedImage} alt="Receipt preview" className="max-h-48 mx-auto rounded-xl shadow-md border border-border/40 object-contain" />
                                <div className="flex justify-center gap-2">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => handleImageSelect(e)}
                                            className="hidden"
                                        />
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all">
                                            <Upload className="h-3.5 w-3.5" /> Retake / Choose New Photo
                                        </span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer space-y-2 block">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => handleImageSelect(e)}
                                    className="hidden"
                                />
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-foreground block">Take Photo or Select Receipt Image</span>
                                    <span className="text-[10px] text-muted-foreground">Supports JPG, PNG, WEBP receipts</span>
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Manual / Pasted Text Receipt OCR Zone */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" /> Receipt Text / Note Snippet (Optional OCR Text)
                        </label>
                        <textarea
                            value={ocrInputText}
                            onChange={(e) => {
                                setOcrInputText(e.target.value)
                                if (e.target.value.trim()) {
                                    const parsed = parseReceiptText(e.target.value)
                                    setExtractedData(parsed)
                                }
                            }}
                            rows={3}
                            placeholder="e.g. Carrefour Taiwan&#10;2026-08-02&#10;Milk, Bread, Fruits&#10;TOTAL: 450"
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Extracted Details Preview Card */}
                    {extractedData && (
                        <div className="bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-primary/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-wider">
                                <Check className="h-4 w-4" /> Extracted Receipt Details:
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-background/80 p-2.5 rounded-xl border border-border/30">
                                    <span className="text-[10px] text-muted-foreground block font-bold">Store / Description</span>
                                    <span className="font-bold text-foreground truncate block">{extractedData.description}</span>
                                </div>
                                <div className="bg-background/80 p-2.5 rounded-xl border border-border/30">
                                    <span className="text-[10px] text-muted-foreground block font-bold">Total Amount</span>
                                    <span className="font-black text-emerald-500 text-sm tabular-nums block">
                                        {extractedData.amount ? `${currInfo.symbol}${extractedData.amount}` : "Not detected"}
                                    </span>
                                </div>
                                <div className="bg-background/80 p-2.5 rounded-xl border border-border/30">
                                    <span className="text-[10px] text-muted-foreground block font-bold">Detected Category</span>
                                    <span className="font-bold text-sky-500 uppercase text-[10px] block">{extractedData.category}</span>
                                </div>
                                <div className="bg-background/80 p-2.5 rounded-xl border border-border/30">
                                    <span className="text-[10px] text-muted-foreground block font-bold">Date</span>
                                    <span className="font-bold text-foreground text-[11px] block">{extractedData.date}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        amount: extractedData.amount || prev.amount,
                                        description: extractedData.description || prev.description,
                                        category: extractedData.category || prev.category,
                                        date: extractedData.date || prev.date
                                    }))
                                    setShowScanModal(false)
                                    setShowForm(true)
                                }}
                                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-emerald-500/20 mt-2"
                            >
                                <ArrowRight className="h-4 w-4" /> Apply & Auto-Fill Expense Form
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
