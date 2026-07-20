import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, TrendingDown, Target, Wallet as WalletIcon, Star } from "lucide-react"
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
    // Exclude transfers from calculations so they don't bloat the reports
    const totalIncome = useMemo(() => 
        entries.filter(e => e.type === "income" && e.category !== "transfer").reduce((s, e) => s + e.amount, 0),
        [entries]
    )

    const totalExpense = useMemo(() => 
        entries.filter(e => e.type === "expense" && e.category !== "transfer").reduce((s, e) => s + e.amount, 0),
        [entries]
    )

    // Monthly breakdown (excluding transfers)
    const monthlyData = useMemo(() => {
        const months: Record<string, { income: number; expense: number }> = {}
        entries.forEach(e => {
            if (e.category === "transfer") return // Skip transfers
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

    // Category breakdown (expenses only, excluding transfers)
    const categoryData = useMemo(() => {
        const cats: Record<string, number> = {}
        entries.filter(e => e.type === "expense" && e.category !== "transfer").forEach(e => {
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

    // Wishlist analytics
    const wishlistStats = useMemo(() => {
        const wishlistEntries = entries.filter(e => e.category === "wishlist")
        const totalSpent = wishlistEntries.reduce((sum, e) => sum + e.amount, 0)
        return {
            count: wishlistEntries.length,
            totalSpent,
        }
    }, [entries])

    // Totals
    const totalDebt = debts.reduce((s, d) => s + d.total_amount, 0)
    const totalDebtPaid = debts.reduce((s, d) => s + d.paid_amount, 0)
    const walletTotal = wallets.reduce((s, w) => s + w.balance, 0)
    const netWorth = walletTotal - (totalDebt - totalDebtPaid)

    // Savings Rate percentage
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

    // Max values for bar sizing
    const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1)
    const maxCategory = Math.max(...categoryData.map(c => c.amount), 1)

    // Complete list of beautiful tailwind colors matching all 21 categories
    const CATEGORY_COLORS: Record<string, string> = {
        food: "bg-amber-500",
        groceries: "bg-emerald-500",
        transport: "bg-sky-500",
        gas_fuel: "bg-blue-600",
        bills: "bg-orange-500",
        rent_housing: "bg-indigo-600",
        shopping: "bg-rose-500",
        clothing: "bg-pink-500",
        allowance: "bg-teal-500",
        health: "bg-red-500",
        personal_care: "bg-fuchsia-500",
        education: "bg-violet-500",
        entertainment: "bg-yellow-500",
        subscriptions: "bg-rose-600",
        insurance: "bg-cyan-600",
        gifts_given: "bg-emerald-600",
        pets: "bg-amber-600",
        repairs: "bg-zinc-500",
        debt_payment: "bg-orange-600",
        wishlist: "bg-sky-600",
        transfer: "bg-stone-500",
        other: "bg-stone-400",
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Income", value: totalIncome, color: "text-emerald-500", icon: TrendingUp, bg: "bg-emerald-500/10" },
                    { label: "Total Expenses", value: totalExpense, color: "text-rose-500", icon: TrendingDown, bg: "bg-rose-500/10" },
                    { label: "Savings Rate", value: savingsRate, color: savingsRate >= 20 ? "text-emerald-500" : savingsRate > 0 ? "text-amber-500" : "text-rose-500", icon: Star, bg: "bg-amber-500/10", isPercent: true },
                    { label: "Net Worth", value: netWorth, color: netWorth >= 0 ? "text-emerald-500" : "text-rose-500", icon: BarChart3, bg: "bg-primary/10" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 shadow-sm"
                    >
                        <div className={cn("p-2 rounded-xl w-fit mb-2", stat.bg)}>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        <p className={cn("text-lg font-black tabular-nums tracking-tight mt-0.5", stat.color)}>
                            {stat.isPercent ? (
                                `${Math.round(stat.value)}%`
                            ) : (
                                <>{stat.value < 0 && "-"}{formatPeso(stat.value)}</>
                            )}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Savings Rate Tip */}
            {totalIncome > 0 && (
                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        💡 Budget Advice: 
                        <span className="text-foreground">
                            {savingsRate >= 30 ? "Outstanding! You have a high savings rate. Consider investing your surplus." :
                             savingsRate >= 20 ? "Excellent! You are hitting the recommended 20% savings rule." :
                             savingsRate > 0 ? "Good start, but try to minimize shopping or subscriptions to reach 20% savings." :
                             "Alert: You spent more than you earned this period. Review your categories below."}
                        </span>
                    </span>
                </div>
            )}

            {/* Monthly Breakdown */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4 shadow-sm">
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
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4 shadow-sm">
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
                                transition={{ delay: i * 0.04 }}
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
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                            className={cn("h-full rounded-full", CATEGORY_COLORS[cat.category] || "bg-stone-400")}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs font-black tabular-nums text-rose-500 w-20 text-right shrink-0 font-sans">
                                    {formatPeso(cat.amount)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Twin Columns for Wallets & Debts/Wishlist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Wallet Balances */}
                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                        <WalletIcon className="h-4.5 w-4.5 text-emerald-500" /> Wallet Balances
                    </h3>
                    <div className="divide-y divide-border/10 max-h-[250px] overflow-y-auto scrollbar-none pr-1">
                        {wallets.map(w => (
                            <div key={w.id} className="flex items-center justify-between py-2 text-xs">
                                <span className="font-bold text-muted-foreground">{w.name}</span>
                                <span className={cn(
                                    "font-black tabular-nums",
                                    w.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {w.balance < 0 && "-"}{formatPeso(w.balance)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border/30 pt-2 flex items-center justify-between text-xs">
                        <span className="font-black">Total Net Cash</span>
                        <span className={cn(
                            "font-black tabular-nums",
                            walletTotal >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {walletTotal < 0 && "-"}{formatPeso(walletTotal)}
                        </span>
                    </div>
                </div>

                {/* Debts & Wishlist Summary */}
                <div className="space-y-4">
                    {/* Debt Payoff Progress */}
                    {debts.length > 0 && (
                        <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Target className="h-4 w-4 text-orange-500" /> Debt Payoff Progress
                            </h3>
                            <div className="space-y-2 max-h-[110px] overflow-y-auto scrollbar-none pr-1">
                                {debts.map(d => {
                                    const pct = d.total_amount > 0 ? (d.paid_amount / d.total_amount) * 100 : 0
                                    return (
                                        <div key={d.id} className="space-y-1">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className={cn("font-bold", d.is_settled && "text-emerald-500 line-through")}>{d.label}</span>
                                                <span className="font-black tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
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
                    )}

                    {/* Wishlist Tracking */}
                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <Star className="h-4 w-4 text-sky-500" /> Wishlist Completed
                        </h3>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-muted-foreground">Purchased Items:</span>
                            <span className="font-black text-sky-500">{wishlistStats.count} items</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-muted-foreground">Total Paid for Wishlist:</span>
                            <span className="font-black text-emerald-500">{formatPeso(wishlistStats.totalSpent)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
