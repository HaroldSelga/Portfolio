import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, TrendingDown, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import type { FinanceEntry, Wallet } from "./types"
import { EXPENSE_CATEGORIES } from "./types"

interface ExpenseSectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    onAdd: (entry: Omit<FinanceEntry, "id" | "created_at">) => void
    onDelete: (id: string) => void
}

function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ExpenseSection({ entries, wallets, onAdd, onDelete }: ExpenseSectionProps) {
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        category: "food",
        description: "",
        amount: "",
        wallet_id: wallets[0]?.id || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.amount || !formData.wallet_id) return

        onAdd({
            type: "expense",
            date: formData.date,
            category: formData.category,
            description: formData.description || EXPENSE_CATEGORIES.find(c => c.value === formData.category)?.label || "Expense",
            amount: parseFloat(formData.amount),
            wallet_id: formData.wallet_id,
        })

        setFormData({
            date: new Date().toISOString().split("T")[0],
            category: "food",
            description: "",
            amount: "",
            wallet_id: wallets[0]?.id || "",
        })
        setShowForm(false)
    }

    const expenseEntries = entries.filter(e => e.type === "expense").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 rounded-xl">
                        <TrendingDown className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Expenses</h3>
                        <p className="text-xs font-bold text-muted-foreground tabular-nums">
                            Total: <span className="text-rose-500">{formatPeso(totalExpenses)}</span>
                        </p>
                    </div>
                </div>
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
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Wallet</label>
                                    <select
                                        value={formData.wallet_id}
                                        onChange={e => setFormData({ ...formData, wallet_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    >
                                        {wallets.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grab ride to work"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                            </div>
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

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                                >
                                    <span className="text-lg">{cat?.emoji || "📦"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{entry.description || cat?.label || "Expense"}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{new Date(entry.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                                            <span>·</span>
                                            <span className="px-1.5 py-0.5 bg-muted rounded-md text-[10px] font-bold uppercase">
                                                {cat?.label || entry.category}
                                            </span>
                                            {wallet && (
                                                <>
                                                    <span>·</span>
                                                    <span>{wallet.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-black tabular-nums text-rose-500">
                                        -{formatPeso(entry.amount)}
                                    </span>
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
