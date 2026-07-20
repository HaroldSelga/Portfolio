import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, TrendingDown, X, AlertCircle, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import type { FinanceEntry, Wallet, CategoryBudget } from "./types"
import { EXPENSE_CATEGORIES } from "./types"

interface ExpenseSectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    budgets: CategoryBudget[]
    onAdd: (entry: Omit<FinanceEntry, "id" | "created_at">) => void
    onDelete: (id: string) => void
}

function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ExpenseSection({ entries, wallets, budgets, onAdd, onDelete }: ExpenseSectionProps) {
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        category: "food",
        description: "",
        amount: "",
        wallet_id: wallets[0]?.id || "",
    })

    const currentMonthPrefix = useMemo(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    }, [])

    // Calculate current spending for a specific category this month
    const getCategorySpentThisMonth = (category: string) => {
        return entries
            .filter(e => e.type === "expense" && e.category === category && e.date.startsWith(currentMonthPrefix))
            .reduce((sum, e) => sum + e.amount, 0)
    }

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
    }, [formData.category, formData.amount, budgets, entries, currentMonthPrefix])

    // List of budgets that are close to or exceeding limits
    const budgetAlerts = useMemo(() => {
        return budgets.map(budget => {
            const spent = getCategorySpentThisMonth(budget.category)
            const percent = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0
            const catInfo = EXPENSE_CATEGORIES.find(c => c.value === budget.category)
            return { budget, spent, percent, catInfo }
        }).filter(item => item.percent >= 80)
    }, [budgets, entries, currentMonthPrefix])

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
                                        <span>Spent: {formatPeso(spent)}</span>
                                        <span>Limit: {formatPeso(budget.limit_amount)}</span>
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
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grab ride to work"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                                                {formatPeso(activeBudget.totalProjected)} / {formatPeso(activeBudget.limit)}
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
