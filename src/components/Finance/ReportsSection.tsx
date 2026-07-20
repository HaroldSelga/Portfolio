import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, TrendingDown, Target, Wallet as WalletIcon, Star, ArrowUp, ArrowDown, Minus, Calendar, ChevronLeft, ChevronRight, PiggyBank } from "lucide-react"
import { cn } from "../../lib/utils"
import type { FinanceEntry, Wallet, Debt, SavingsFund } from "./types"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./types"

interface ReportsSectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    debts: Debt[]
    funds: SavingsFund[]
}

function formatPeso(amount: number): string {
    return `₱${Math.abs(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function getMonthLabel(key: string): string {
    return new Date(key + "-01").toLocaleDateString("en-PH", { month: "long", year: "numeric" })
}

function getShortMonthLabel(key: string): string {
    return new Date(key + "-01").toLocaleDateString("en-PH", { month: "short", year: "2-digit" })
}

export function ReportsSection({ entries, wallets, debts, funds }: ReportsSectionProps) {
    const now = new Date()
    const currentMonthKey = getMonthKey(now)

    // Selected month for detailed view (default: current month)
    const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey)

    // All unique months sorted descending
    const allMonths = useMemo(() => {
        const set = new Set<string>()
        entries.forEach(e => {
            if (e.category !== "transfer") set.add(e.date.substring(0, 7))
        })
        // Always include current month even if no entries
        set.add(currentMonthKey)
        return Array.from(set).sort((a, b) => b.localeCompare(a))
    }, [entries, currentMonthKey])

    // Navigate months
    const selectedIdx = allMonths.indexOf(selectedMonthKey)
    const canGoNewer = selectedIdx > 0
    const canGoOlder = selectedIdx < allMonths.length - 1

    const goNewer = () => { if (canGoNewer) setSelectedMonthKey(allMonths[selectedIdx - 1]) }
    const goOlder = () => { if (canGoOlder) setSelectedMonthKey(allMonths[selectedIdx + 1]) }

    // Compute month data (excluding transfers and virtual savings deposits/withdrawals from core spending)
    const getMonthData = (monthKey: string) => {
        const monthEntries = entries.filter(e => e.date.startsWith(monthKey) && e.category !== "transfer")
        
        // Income (excluding fund withdrawals which are just returns to wallets)
        const income = monthEntries
            .filter(e => e.type === "income" && e.category !== "savings_withdraw")
            .reduce((s, e) => s + e.amount, 0)
            
        // Expense (excluding fund deposits which are savings allocations)
        const expense = monthEntries
            .filter(e => e.type === "expense" && e.category !== "savings_deposit")
            .reduce((s, e) => s + e.amount, 0)

        // Savings entries recorded this month
        const savedToFunds = monthEntries
            .filter(e => e.category === "savings_deposit")
            .reduce((s, e) => s + e.amount, 0)

        const withdrawnFromFunds = monthEntries
            .filter(e => e.category === "savings_withdraw")
            .reduce((s, e) => s + e.amount, 0)

        // Net saved includes standard surplus + net funds savings
        const netSavingsVolume = (income - expense) + (savedToFunds - withdrawnFromFunds)
        const net = income - expense // Basic cash net

        const daysInMonth = new Date(parseInt(monthKey.split("-")[0]), parseInt(monthKey.split("-")[1]), 0).getDate()
        const today = new Date()
        const isCurrentMonth = monthKey === currentMonthKey
        const daysSoFar = isCurrentMonth ? today.getDate() : daysInMonth
        const dailyAvg = daysSoFar > 0 ? expense / daysSoFar : 0

        return { 
            income, 
            expense, 
            net, 
            netSavingsVolume,
            savedToFunds,
            withdrawnFromFunds,
            daysInMonth, 
            daysSoFar, 
            dailyAvg, 
            entries: monthEntries 
        }
    }

    const selectedData = useMemo(() => getMonthData(selectedMonthKey), [selectedMonthKey, entries])

    // Previous month for comparison
    const prevMonthKey = useMemo(() => {
        const [y, m] = selectedMonthKey.split("-").map(Number)
        const prev = new Date(y, m - 2, 1)
        return getMonthKey(prev)
    }, [selectedMonthKey])
    const prevData = useMemo(() => getMonthData(prevMonthKey), [prevMonthKey, entries])

    // Delta calculations
    const incomeDelta = selectedData.income - prevData.income
    const expenseDelta = selectedData.expense - prevData.expense
    const netDelta = selectedData.netSavingsVolume - prevData.netSavingsVolume
    
    const incomePercent = prevData.income > 0 ? (incomeDelta / prevData.income) * 100 : (selectedData.income > 0 ? 100 : 0)
    const expensePercent = prevData.expense > 0 ? (expenseDelta / prevData.expense) * 100 : (selectedData.expense > 0 ? 100 : 0)

    // Savings rate (considering total income and net savings volume)
    const savingsRate = selectedData.income > 0 ? (selectedData.netSavingsVolume / selectedData.income) * 100 : 0

    // Top 3 biggest expenses this month (excluding savings deposits)
    const top3Expenses = useMemo(() => {
        return selectedData.entries
            .filter(e => e.type === "expense" && e.category !== "savings_deposit")
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3)
    }, [selectedData])

    // Category breakdown (expenses, selected month)
    const categoryData = useMemo(() => {
        const cats: Record<string, number> = {}
        selectedData.entries.filter(e => e.type === "expense" && e.category !== "savings_deposit").forEach(e => {
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
    }, [selectedData])

    // Income source breakdown (selected month)
    const incomeSourceData = useMemo(() => {
        const cats: Record<string, number> = {}
        selectedData.entries.filter(e => e.type === "income" && e.category !== "savings_withdraw").forEach(e => {
            cats[e.category] = (cats[e.category] || 0) + e.amount
        })
        const total = Object.values(cats).reduce((sum, v) => sum + v, 0)
        return Object.entries(cats)
            .map(([category, amount]) => ({
                category,
                amount,
                percent: total > 0 ? (amount / total) * 100 : 0,
                info: INCOME_CATEGORIES.find(c => c.value === category),
            }))
            .sort((a, b) => b.amount - a.amount)
    }, [selectedData])

    // Monthly breakdown for the bar chart (all months, excluding transfers)
    const monthlyData = useMemo(() => {
        const months: Record<string, { income: number; expense: number }> = {}
        entries.forEach(e => {
            if (e.category === "transfer") return
            const key = e.date.substring(0, 7)
            if (!months[key]) months[key] = { income: 0, expense: 0 }
            
            if (e.type === "income") {
                if (e.category !== "savings_withdraw") months[key].income += e.amount
            } else {
                if (e.category !== "savings_deposit") months[key].expense += e.amount
            }
        })
        return Object.entries(months)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, data]) => ({
                month,
                label: getMonthLabel(month),
                shortLabel: getShortMonthLabel(month),
                ...data,
                net: data.income - data.expense,
            }))
    }, [entries])

    // Totals (all time, excluding transfers)
    const totalDebt = debts.reduce((s, d) => s + d.total_amount, 0)
    const totalDebtPaid = debts.reduce((s, d) => s + d.paid_amount, 0)
    const walletTotal = wallets.reduce((s, w) => s + w.balance, 0)
    const netWorth = walletTotal - (totalDebt - totalDebtPaid)

    // Savings Funds summary stats
    const totalSavedFunds = funds.reduce((sum, f) => sum + f.current_amount, 0)
    const totalTargetFunds = funds.reduce((sum, f) => sum + f.target_amount, 0)

    const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1)
    const maxCategory = Math.max(...categoryData.map(c => c.amount), 1)
    const maxIncomeSource = Math.max(...incomeSourceData.map(c => c.amount), 1)

    // Wishlist analytics
    const wishlistStats = useMemo(() => {
        const wishlistEntries = entries.filter(e => e.category === "wishlist")
        return {
            count: wishlistEntries.length,
            totalSpent: wishlistEntries.reduce((sum, e) => sum + e.amount, 0),
        }
    }, [entries])

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
        savings_deposit: "bg-emerald-400",
        transfer: "bg-stone-500",
        other: "bg-stone-400",
    }

    const INCOME_COLORS: Record<string, string> = {
        salary: "bg-emerald-500",
        freelance: "bg-sky-500",
        side_hustle: "bg-violet-500",
        bonus: "bg-amber-500",
        investment: "bg-indigo-500",
        gift_received: "bg-pink-500",
        allowance_received: "bg-teal-500",
        sold_items: "bg-orange-500",
        refund: "bg-cyan-500",
        savings_withdraw: "bg-emerald-400",
        transfer: "bg-stone-500",
        other: "bg-stone-400",
    }

    const DeltaArrow = ({ value, invert = false }: { value: number; invert?: boolean }) => {
        const isPositive = invert ? value < 0 : value > 0
        const isNeutral = value === 0
        if (isNeutral) return <Minus className="h-3 w-3 text-muted-foreground" />
        return isPositive
            ? <ArrowUp className="h-3 w-3 text-emerald-500" />
            : <ArrowDown className="h-3 w-3 text-rose-500" />
    }

    return (
        <div className="space-y-5">
            {/* ═══════════════════════════════════════════ */}
            {/* MONTH SELECTOR */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                <button
                    onClick={goOlder}
                    disabled={!canGoOlder}
                    className="p-2 rounded-xl hover:bg-muted disabled:opacity-20 transition-all"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-center">
                    <div className="flex items-center gap-2 justify-center">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-tight">{getMonthLabel(selectedMonthKey)}</h2>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                        comparing trends vs {getMonthLabel(prevMonthKey)}
                    </p>
                </div>
                <button
                    onClick={goNewer}
                    disabled={!canGoNewer}
                    className="p-2 rounded-xl hover:bg-muted disabled:opacity-20 transition-all"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* MONTH vs PREVIOUS MONTH COMPARISON */}
            {/* ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Income */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 shadow-sm"
                >
                    <div className="p-2 rounded-xl w-fit mb-2 bg-emerald-500/10">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Income</p>
                    <p className="text-lg font-black tabular-nums tracking-tight text-emerald-500 mt-0.5">{formatPeso(selectedData.income)}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                        <DeltaArrow value={incomeDelta} />
                        <span className={cn("text-[10px] font-bold tabular-nums", incomeDelta >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {incomeDelta >= 0 ? "+" : "-"}{formatPeso(incomeDelta)} ({incomePercent >= 0 ? "+" : ""}{Math.round(incomePercent)}%)
                        </span>
                    </div>
                </motion.div>

                {/* Expenses */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 shadow-sm"
                >
                    <div className="p-2 rounded-xl w-fit mb-2 bg-rose-500/10">
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Spend</p>
                    <p className="text-lg font-black tabular-nums tracking-tight text-rose-500 mt-0.5">{formatPeso(selectedData.expense)}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                        <DeltaArrow value={expenseDelta} invert />
                        <span className={cn("text-[10px] font-bold tabular-nums", expenseDelta <= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {expenseDelta >= 0 ? "+" : "-"}{formatPeso(expenseDelta)} ({expensePercent >= 0 ? "+" : ""}{Math.round(expensePercent)}%)
                        </span>
                    </div>
                </motion.div>

                {/* Net Savings Volume */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 shadow-sm"
                >
                    <div className="p-2 rounded-xl w-fit mb-2 bg-primary/10">
                        <Star className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Net Savings Vol.</p>
                    <p className={cn("text-lg font-black tabular-nums tracking-tight mt-0.5", selectedData.netSavingsVolume >= 0 ? "text-emerald-500" : "text-rose-500")}>
                        {selectedData.netSavingsVolume < 0 && "-"}{formatPeso(selectedData.netSavingsVolume)}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                        <DeltaArrow value={netDelta} />
                        <span className={cn("text-[10px] font-bold tabular-nums", netDelta >= 0 ? "text-emerald-500" : "text-rose-500")}>
                            {netDelta >= 0 ? "+" : "-"}{formatPeso(netDelta)}
                        </span>
                    </div>
                </motion.div>

                {/* Daily Average */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 shadow-sm"
                >
                    <div className="p-2 rounded-xl w-fit mb-2 bg-amber-500/10">
                        <BarChart3 className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Avg Spend</p>
                    <p className="text-lg font-black tabular-nums tracking-tight text-amber-500 mt-0.5">{formatPeso(selectedData.dailyAvg)}</p>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1.5">
                        {selectedData.daysSoFar} of {selectedData.daysInMonth} days
                    </p>
                </motion.div>
            </div>

            {/* Savings Rate Tip */}
            {selectedData.income > 0 && (
                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3.5 flex items-start gap-3 text-xs font-semibold shadow-sm">
                    <span className="text-lg">💡</span>
                    <div>
                        <span className="text-muted-foreground">Total Savings Rate: </span>
                        <span className={cn("font-black", savingsRate >= 20 ? "text-emerald-500" : savingsRate > 0 ? "text-amber-500" : "text-rose-500")}>
                            {Math.round(savingsRate)}%
                        </span>
                        <span className="text-muted-foreground ml-1">—</span>
                        <span className="text-foreground ml-1">
                            {savingsRate >= 30 ? "Outstanding! You saved a substantial chunk. Keep stacking your funds." :
                             savingsRate >= 20 ? "Awesome! You are hitting the target 20% savings rule." :
                             savingsRate > 0 ? "Good progress. Try to reduce shopping to increase your monthly savings rate." :
                             "Alert: You spent more than you earned this month. Check your top expenses below."}
                        </span>
                    </div>
                </div>
            )}

            {/* Monthly Fund Contributions Alert */}
            {(selectedData.savedToFunds > 0 || selectedData.withdrawnFromFunds > 0) && (
                <div className="bg-card/40 border border-border/20 rounded-2xl p-3 flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>PiggyBank Activity:</span>
                    <div className="flex gap-4">
                        {selectedData.savedToFunds > 0 && (
                            <span>Deposited to Funds: <span className="text-emerald-500">+{formatPeso(selectedData.savedToFunds)}</span></span>
                        )}
                        {selectedData.withdrawnFromFunds > 0 && (
                            <span>Withdrawn: <span className="text-rose-500">-{formatPeso(selectedData.withdrawnFromFunds)}</span></span>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* TOP 3 BIGGEST EXPENSES THIS MONTH */}
            {/* ═══════════════════════════════════════════ */}
            {top3Expenses.length > 0 && (
                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                        🔥 Top {top3Expenses.length} Biggest Expenses
                    </h3>
                    <div className="space-y-2">
                        {top3Expenses.map((entry, i) => {
                            const cat = EXPENSE_CATEGORIES.find(c => c.value === entry.category)
                            const wallet = wallets.find(w => w.id === entry.wallet_id)
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex items-center gap-3 py-1.5"
                                >
                                    <span className="text-lg w-8 h-8 flex items-center justify-center bg-muted/60 rounded-xl shrink-0">
                                        {cat?.emoji || "📦"}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate">{entry.description || cat?.label}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">
                                            {new Date(entry.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                                            {wallet && <> · {wallet.name}</>}
                                        </p>
                                    </div>
                                    <span className="text-sm font-black tabular-nums text-rose-500 shrink-0">
                                        -{formatPeso(entry.amount)}
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* EXPENSE CATEGORY BREAKDOWN (selected month) */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-rose-500" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Where Your Money Goes</h3>
                </div>

                {categoryData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm font-bold text-muted-foreground">No expenses this month</p>
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
                                <span className="text-xs font-black tabular-nums text-rose-500 w-20 text-right shrink-0">
                                    {formatPeso(cat.amount)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* INCOME SOURCE BREAKDOWN (selected month) */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Income Sources</h3>
                </div>

                {incomeSourceData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm font-bold text-muted-foreground">No income this month</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {incomeSourceData.map((cat, i) => (
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
                                            animate={{ width: `${(cat.amount / maxIncomeSource) * 100}%` }}
                                            transition={{ duration: 0.6, delay: i * 0.05 }}
                                            className={cn("h-full rounded-full", INCOME_COLORS[cat.category] || "bg-stone-400")}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs font-black tabular-nums text-emerald-500 w-20 text-right shrink-0">
                                    {formatPeso(cat.amount)}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* ALL-TIME MONTHLY TREND CHART */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-tight">All-Time Monthly Trend</h3>
                </div>

                {monthlyData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm font-bold text-muted-foreground">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {monthlyData.map((month, i) => {
                            const isSelected = month.month === selectedMonthKey
                            return (
                                <motion.div
                                    key={month.month}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => setSelectedMonthKey(month.month)}
                                    className={cn(
                                        "space-y-1.5 p-2 rounded-xl cursor-pointer transition-all",
                                        isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-xs font-bold", isSelected && "text-primary")}>{month.label}</span>
                                        <span className={cn(
                                            "text-xs font-black tabular-nums",
                                            month.net >= 0 ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {month.net >= 0 ? "+" : "-"}{formatPeso(month.net)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-emerald-500 w-8 shrink-0">IN</span>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(month.income / maxMonthly) * 100}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.04 }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-20 text-right">
                                            {formatPeso(month.income)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-rose-500 w-8 shrink-0">OUT</span>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(month.expense / maxMonthly) * 100}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.04 + 0.08 }}
                                                className="h-full bg-rose-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold tabular-nums text-muted-foreground w-20 text-right">
                                            {formatPeso(month.expense)}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* BOTTOM: WALLETS, DEBTS, WISHLIST, FUNDS */}
            {/* ═══════════════════════════════════════════ */}
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
                        <span className="font-black">Net Worth</span>
                        <span className={cn(
                            "font-black tabular-nums",
                            netWorth >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {netWorth < 0 && "-"}{formatPeso(netWorth)}
                        </span>
                    </div>
                </div>

                {/* Savings Funds & Wishlist Summary */}
                <div className="space-y-4">
                    {/* Savings Goals Completion */}
                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-emerald-500" /> Savings Goals Progress
                        </h3>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-muted-foreground font-sans">Total Saved in Funds:</span>
                            <span className="font-black text-emerald-500">{formatPeso(totalSavedFunds)}</span>
                        </div>
                        {totalTargetFunds > 0 && (
                            <div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${Math.min((totalSavedFunds / totalTargetFunds) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] text-muted-foreground font-bold mt-1">
                                    <span>{Math.round((totalSavedFunds / totalTargetFunds) * 100)}% Complete</span>
                                    <span>Target: {formatPeso(totalTargetFunds)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wishlist Tracking */}
                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                            <Star className="h-4 w-4 text-sky-500" /> Wishlist Completed
                        </h3>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-muted-foreground">Purchased:</span>
                            <span className="font-black text-sky-500">{wishlistStats.count} items</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-muted-foreground">Total Spent:</span>
                            <span className="font-black text-emerald-500">{formatPeso(wishlistStats.totalSpent)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
