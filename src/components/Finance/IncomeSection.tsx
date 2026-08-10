import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, TrendingUp, X, Briefcase, Repeat, Check, Pencil } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import type { FinanceEntry, Wallet, CurrencyCode } from "./types"
import { INCOME_CATEGORIES, CURRENCIES, formatCurrency, getLocalDateString, getDefaultSmartWallet } from "./types"
import { Modal } from "../ui/Modal"

interface NetSalaryPreset {
    amount: number
    profileLabel: string
    currency: CurrencyCode
    targetWalletId?: string
}

export interface RecurringIncomeTemplate {
    id: string
    label: string
    amount: number
    category: string
    wallet_id: string
    day_of_month: number
}

interface IncomeSectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    showAmounts?: boolean
    netSalaryPreset?: NetSalaryPreset | null
    onAdd: (entry: Omit<FinanceEntry, "id" | "created_at">) => void
    onDelete: (id: string) => void
    onEdit?: (id: string, updates: Partial<Omit<FinanceEntry, "id" | "created_at">>) => void
}

export function IncomeSection({ entries, wallets, showAmounts = true, netSalaryPreset, onAdd, onDelete, onEdit }: IncomeSectionProps) {
    const [showForm, setShowForm] = useState(false)
    const [showRecurringManager, setShowRecurringManager] = useState(false)
    const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null)
    const [recurringTemplates, setRecurringTemplates] = useState<RecurringIncomeTemplate[]>(() => {
        try {
            const stored = localStorage.getItem("finance_recurring_income")
            if (stored) return JSON.parse(stored)
        } catch (e) {
            console.warn("Error loading recurring income templates:", e)
        }
        return []
    })

    const [newRecurring, setNewRecurring] = useState({
        label: "",
        amount: "",
        category: "salary",
        wallet_id: getDefaultSmartWallet(wallets),
        day_of_month: "15"
    })

    const [formData, setFormData] = useState({
        date: getLocalDateString(),
        category: "salary",
        description: "",
        amount: "",
        wallet_id: getDefaultSmartWallet(wallets),
        notes: "",
    })

    const activeWalletId = formData.wallet_id || wallets[0]?.id || ""
    const selectedWallet = wallets.find(w => w.id === activeWalletId)
    const walletCurrency: CurrencyCode = selectedWallet?.currency || "PHP"
    const currInfo = CURRENCIES[walletCurrency] || CURRENCIES.PHP

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const targetWalletId = activeWalletId
        if (!formData.amount || !targetWalletId) return

        onAdd({
            type: "income",
            date: formData.date,
            category: formData.category,
            description: formData.description || INCOME_CATEGORIES.find(c => c.value === formData.category)?.label || "Income",
            amount: parseFloat(formData.amount),
            wallet_id: targetWalletId,
            currency: walletCurrency,
            notes: formData.notes || undefined,
        })

        setFormData({
            date: getLocalDateString(),
            category: "salary",
            description: "",
            amount: "",
            wallet_id: getDefaultSmartWallet(wallets),
            notes: "",
        })
        setShowForm(false)
    }

    const incomeEntries = entries.filter(e => e.type === "income").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const handleAddRecurringTemplate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newRecurring.label || !newRecurring.amount) return
        const item: RecurringIncomeTemplate = {
            id: crypto.randomUUID(),
            label: newRecurring.label,
            amount: parseFloat(newRecurring.amount),
            category: newRecurring.category,
            wallet_id: newRecurring.wallet_id || wallets[0]?.id || "",
            day_of_month: parseInt(newRecurring.day_of_month) || 1,
        }
        const updated = [...recurringTemplates, item]
        setRecurringTemplates(updated)
        localStorage.setItem("finance_recurring_income", JSON.stringify(updated))
        setNewRecurring({ label: "", amount: "", category: "salary", wallet_id: getDefaultSmartWallet(wallets), day_of_month: "15" })
    }

    const handleDeleteRecurringTemplate = (id: string) => {
        const updated = recurringTemplates.filter(t => t.id !== id)
        setRecurringTemplates(updated)
        localStorage.setItem("finance_recurring_income", JSON.stringify(updated))
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Income</h3>
                        <p className="text-xs font-bold text-muted-foreground hidden sm:block">
                            Record your salary, freelance earnings, or side hustle revenues
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowRecurringManager(!showRecurringManager)}
                        className="font-bold rounded-xl gap-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                        size="sm"
                    >
                        <Repeat className="h-3.5 w-3.5" />
                        Recurring
                    </Button>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className={cn(
                            "font-bold rounded-xl gap-2 transition-all",
                            showForm
                                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                        )}
                        size="sm"
                    >
                        {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {showForm ? "Cancel" : "Add Income"}
                    </Button>
                </div>
            </div>

            {/* Recurring Templates Manager Drawer */}
            <AnimatePresence>
                {showRecurringManager && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-card/60 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 space-y-3 overflow-hidden"
                    >
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Repeat className="h-4 w-4 text-emerald-500" /> Manage Scheduled / Recurring Income
                        </h4>

                        <form onSubmit={handleAddRecurringTemplate} className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                            <input
                                type="text"
                                placeholder="Label (e.g. Monthly Allowance)"
                                value={newRecurring.label}
                                onChange={e => setNewRecurring({ ...newRecurring, label: e.target.value })}
                                className="px-3 py-1.5 bg-background border border-border/60 rounded-xl font-medium focus:outline-none"
                                required
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Amount"
                                value={newRecurring.amount}
                                onChange={e => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                                className="px-3 py-1.5 bg-background border border-border/60 rounded-xl font-medium tabular-nums focus:outline-none"
                                required
                            />
                            <input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="Day of Month (1-31)"
                                value={newRecurring.day_of_month}
                                onChange={e => setNewRecurring({ ...newRecurring, day_of_month: e.target.value })}
                                className="px-3 py-1.5 bg-background border border-border/60 rounded-xl font-medium tabular-nums focus:outline-none"
                                required
                            />
                            <select
                                value={newRecurring.wallet_id}
                                onChange={e => setNewRecurring({ ...newRecurring, wallet_id: e.target.value })}
                                className="px-3 py-1.5 bg-background border border-border/60 rounded-xl font-medium focus:outline-none"
                            >
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl">
                                + Save Schedule
                            </Button>
                        </form>

                        {recurringTemplates.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-border/10">
                                {recurringTemplates.map(tmpl => {
                                    const tmplWallet = wallets.find(w => w.id === tmpl.wallet_id)
                                    return (
                                        <div key={tmpl.id} className="flex items-center justify-between p-2 bg-background/60 rounded-xl border border-border/20 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{tmpl.label}</span>
                                                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-500 font-bold rounded">
                                                    Every day {tmpl.day_of_month}
                                                </span>
                                                {tmplWallet && <span className="text-muted-foreground text-[10px]">➔ {tmplWallet.name}</span>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black tabular-nums text-emerald-500">+{formatCurrency(tmpl.amount, tmplWallet?.currency || "PHP", showAmounts)}</span>
                                                <button
                                                    onClick={() => handleDeleteRecurringTemplate(tmpl.id)}
                                                    className="p-1 text-muted-foreground/40 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Recurring Claim Banner */}
            {(() => {
                const today = new Date()
                const currentDay = today.getDate()
                const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`

                const pendingItems = recurringTemplates.filter(tmpl => {
                    const alreadyLogged = entries.some(e =>
                        e.type === "income" &&
                        e.date.startsWith(currentMonthKey) &&
                        e.description.includes(tmpl.label)
                    )
                    return !alreadyLogged && Math.abs(currentDay - tmpl.day_of_month) <= 2
                })

                if (pendingItems.length === 0) return null

                return (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 space-y-2">
                        <span className="text-xs font-black uppercase text-emerald-500 flex items-center gap-1.5">
                            <Repeat className="h-4 w-4" /> Pending Scheduled Income for This Pay Period:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {pendingItems.map(tmpl => {
                                const tmplWallet = wallets.find(w => w.id === tmpl.wallet_id)
                                return (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => {
                                            onAdd({
                                                type: "income",
                                                date: getLocalDateString(),
                                                category: tmpl.category,
                                                description: `Recurring Income: ${tmpl.label}`,
                                                amount: tmpl.amount,
                                                wallet_id: tmpl.wallet_id,
                                                currency: tmplWallet?.currency || "PHP"
                                            })
                                        }}
                                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-600 shadow-md transition-all"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Claim {tmpl.label} ({formatCurrency(tmpl.amount, tmplWallet?.currency || "PHP", showAmounts)})</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })()}

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
                        <div className="bg-card/60 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                            {/* Quick Net Salary Preset Button */}
                            {netSalaryPreset && netSalaryPreset.amount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            date: getLocalDateString(),
                                            category: "salary",
                                            description: `Salary Payout — ${netSalaryPreset.profileLabel}`,
                                            amount: netSalaryPreset.amount.toString(),
                                            wallet_id: netSalaryPreset.targetWalletId || formData.wallet_id || wallets[0]?.id || "",
                                            notes: "",
                                        })
                                    }}
                                    className="w-full p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-all text-emerald-500 group shadow-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 shrink-0 text-emerald-500 group-hover:scale-110 transition-transform" />
                                        <span>Auto-fill Current Net Salary ({netSalaryPreset.profileLabel})</span>
                                    </span>
                                    <span className="font-black tabular-nums">
                                        +{formatCurrency(netSalaryPreset.amount, netSalaryPreset.currency, showAmounts)} ➔
                                    </span>
                                </button>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        {INCOME_CATEGORIES.map(cat => (
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
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Deposit To Wallet</label>
                                    <select
                                        value={formData.wallet_id}
                                        onChange={e => setFormData({ ...formData, wallet_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                                    placeholder="e.g. Monthly salary, Freelance project"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes / Memo (optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Additional details, invoice numbers, or memos..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                Add Income
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Entries List */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden">
                {incomeEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-bold text-muted-foreground">No income entries yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Your income records will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {incomeEntries.map((entry, i) => {
                            const cat = INCOME_CATEGORIES.find(c => c.value === entry.category)
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
                                    <span className="text-lg">{cat?.emoji || "💰"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{entry.description || cat?.label || "Income"}</p>
                                        {entry.notes && (
                                            <p className="text-xs text-muted-foreground/80 italic font-normal truncate">{entry.notes}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{new Date(entry.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                                            {wallet && (
                                                <>
                                                    <span>·</span>
                                                    <span className="font-semibold text-foreground/80">{wallet.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-black tabular-nums text-emerald-500 shrink-0 ml-1">
                                        +{formatCurrency(entry.amount, entryCurrency, showAmounts)}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to delete this income entry?")) {
                                                onDelete(entry.id)
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove entry"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    {onEdit && (
                                        <button
                                            onClick={() => setEditingEntry(entry)}
                                            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-sky-500 hover:bg-sky-500/10 transition-all opacity-0 group-hover:opacity-100"
                                            title="Edit entry"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Edit Entry Modal */}
            {onEdit && (
                <Modal
                    isOpen={!!editingEntry}
                    onClose={() => setEditingEntry(null)}
                    title="Edit Income Entry"
                    className="max-w-md"
                >
                    {editingEntry && (() => {
                        const editWallet = wallets.find(w => w.id === editingEntry.wallet_id)
                        const editCurr: CurrencyCode = editWallet?.currency || "PHP"
                        const editCurrInfo = CURRENCIES[editCurr] || CURRENCIES.PHP
                        return (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const formEl = e.currentTarget
                                    const fd = new FormData(formEl)
                                    onEdit(editingEntry.id, {
                                        date: fd.get("date") as string,
                                        category: fd.get("category") as string,
                                        description: (fd.get("description") as string) || INCOME_CATEGORIES.find(c => c.value === fd.get("category"))?.label || "Income",
                                        amount: parseFloat(fd.get("amount") as string),
                                        wallet_id: fd.get("wallet_id") as string,
                                        notes: (fd.get("notes") as string) || undefined,
                                    })
                                    setEditingEntry(null)
                                }}
                                className="p-6 space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            defaultValue={editingEntry.date}
                                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                                        <select
                                            name="category"
                                            defaultValue={editingEntry.category}
                                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            {INCOME_CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount ({editCurrInfo.symbol})</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        step="any"
                                        min="0.000001"
                                        defaultValue={editingEntry.amount}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Wallet</label>
                                    <select
                                        name="wallet_id"
                                        defaultValue={editingEntry.wallet_id}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        {wallets.map(w => {
                                            const wCurr = w.currency || "PHP"
                                            const flag = CURRENCIES[wCurr]?.flag || "🇵🇭"
                                            return <option key={w.id} value={w.id}>{flag} {w.name}</option>
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        defaultValue={editingEntry.description}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes (optional)</label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        defaultValue={editingEntry.notes || ""}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button type="button" onClick={() => setEditingEntry(null)} className="flex-1 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-xl">Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20">Save Changes</Button>
                                </div>
                            </form>
                        )
                    })()}
                </Modal>
            )}
        </div>
    )
}
