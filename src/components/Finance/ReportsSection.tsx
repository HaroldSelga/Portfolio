import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, TrendingDown, Target } from "lucide-react"
import { cn } from "../../lib/utils"
import type { FinanceEntry, Wallet, Debt } from "./types"
import { EXPENSE_CATEGORIES } from "./types"

interface ReportsSectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    debts: Debt[]
}

function formatPeso(amount: number): string {
    return `₱${Math.abs(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ReportsSection({ entries, wallets, debts }: ReportsSectionProps) {
    // Monthly breakdown
    const monthlyData = useMemo(() => {
        const months: Record<string, { income: number; expense: number }> = {}
        entries.forEach(e => {
            const key = e.date.substring(0, 7) // "YYYY-MM"
            if (!months[key]) months[key] = { income: 0, expense: 0 }
            if (e.type === "income") months[key].income += e.amount
            else months[key].expense += e.amount
        })
        return Object.entries(months)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, data]) => ({
                month,
                label: new Date(month + "-01").toLocaleDateString("en-PH", { month: "long", year: "numeric" }),
                ...data,
                net: data.income - data.expense,
            }))
    }, [entries])

    // Category breakdown (expenses only)
    const categoryData = useMemo(() => {
        const cats: Record<string, number> = {}
        entries.filter(e => e.type === "expense").forEach(e => {
            cats[e.category] = (cats[e.category] || 0) + e.amount
        })
        const total = Object.values(cats).reduce((sum, v) => sum + v, 0)
        return Object.entries(cats)
            .map(([category, amount]) => ({
                category,
                amount,
                percent: total > 0 ? (amount / total) * 100 : 0,
                info: EXPENSE_CATEGORIES.find(c => c.value === category),
            }))
            .sort((a, b) => b.amount - a.amount)
    }, [entries])

    // Totals
    const totalIncome = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0)
    const totalExpense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0)
    const totalDebt = debts.reduce((s, d) => s + d.total_amount, 0)
    const totalDebtPaid = debts.reduce((s, d) => s + d.paid_amount, 0)
    const walletTotal = wallets.reduce((s, w) => s + w.balance, 0)
    const netWorth = walletTotal - (totalDebt - totalDebtPaid)

    // Max values for bar sizing
    const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1)
    const maxCategory = Math.max(...categoryData.map(c => c.amount), 1)

    const CATEGORY_COLORS: Record<string, string> = {
        food: "bg-amber-500",
        transport: "bg-primary",
        bills: "bg-orange-500",
        shopping: "bg-rose-500",
        allowance: "bg-emerald-500",
        health: "bg-rose-400",
        entertainment: "bg-amber-400",
        debt_payment: "bg-orange-400",
        other: "bg-stone-400",
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Income", value: totalIncome, color: "text-emerald-500", icon: TrendingUp, bg: "bg-emerald-500/10" },
                    { label: "Total Expenses", value: totalExpense, color: "text-rose-500", icon: TrendingDown, bg: "bg-rose-500/10" },
                    { label: "Debt Remaining", value: totalDebt - totalDebtPaid, color: "text-orange-500", icon: Target, bg: "bg-orange-500/10" },
                    { label: "Net Worth", value: netWorth, color: netWorth >= 0 ? "text-emerald-500" : "text-rose-500", icon: BarChart3, bg: "bg-primary/10" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4"
                    >
                        <div className={cn("p-2 rounded-xl w-fit mb-2", stat.bg)}>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        <p className={cn("text-lg font-black tabular-nums tracking-tight mt-0.5", stat.color)}>
                            {stat.value < 0 && "-"}{formatPeso(stat.value)}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Monthly Breakdown</h3>
                </div>

                {monthlyData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm font-bold text-muted-foreground">No transactions yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Add income or expenses to see monthly reports</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {monthlyData.map((month, i) => (
                            <motion.div
                                key={month.month}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="space-y-1.5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">{month.label}</span>
                                    <span className={cn(
                                        "text-xs font-black tabular-nums",
                                        month.net >= 0 ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {month.net >= 0 ? "+" : "-"}{formatPeso(month.net)}
                                    </span>
                                </div>
                                {/* Income bar */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-500 w-8 shrink-0">IN</span>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(month.income / maxMonthly) * 100}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-20 text-right">
                                        {formatPeso(month.income)}
                                    </span>
                                </div>
                                {/* Expense bar */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-rose-500 w-8 shrink-0">OUT</span>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(month.expense / maxMonthly) * 100}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
                                            className="h-full bg-rose-500 rounded-full"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-20 text-right">
                                        {formatPeso(month.expense)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Expense Category Breakdown */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-rose-500" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Where Your Money Goes</h3>
                </div>

                {categoryData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm font-bold text-muted-foreground">No expenses recorded</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Expense categories will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {categoryData.map((cat, i) => (
                            <motion.div
                                key={cat.category}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-base w-6 text-center">{cat.info?.emoji || "📦"}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold truncate">{cat.info?.label || cat.category}</span>
                                        <span className="text-[10px] font-black tabular-nums text-muted-foreground ml-2">
                                            {Math.round(cat.percent)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(cat.amount / maxCategory) * 100}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.06 }}
                                            className={cn("h-full rounded-full", CATEGORY_COLORS[cat.category] || "bg-stone-400")}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs font-black tabular-nums text-rose-500 w-20 text-right shrink-0">
                                    {formatPeso(cat.amount)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Wallet Balances */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="text-primary">💰</span> Wallet Balances
                </h3>
                {wallets.map(w => (
                    <div key={w.id} className="flex items-center justify-between py-1">
                        <span className="text-sm font-bold text-muted-foreground">{w.name}</span>
                        <span className={cn(
                            "text-sm font-black tabular-nums",
                            w.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {w.balance < 0 && "-"}{formatPeso(w.balance)}
                        </span>
                    </div>
                ))}
                <div className="border-t border-border/30 pt-2 flex items-center justify-between">
                    <span className="text-sm font-black">Total</span>
                    <span className={cn(
                        "text-sm font-black tabular-nums",
                        walletTotal >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {walletTotal < 0 && "-"}{formatPeso(walletTotal)}
                    </span>
                </div>
            </div>

            {/* Debt Progress Summary */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" /> Debt Payoff Progress
                </h3>
                {debts.map(d => {
                    const pct = d.total_amount > 0 ? (d.paid_amount / d.total_amount) * 100 : 0
                    return (
                        <div key={d.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className={cn("text-xs font-bold", d.is_settled && "text-emerald-500 line-through")}>{d.label}</span>
                                <span className="text-[10px] font-black tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        d.is_settled ? "bg-emerald-500" : "bg-orange-500"
                                    )}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
