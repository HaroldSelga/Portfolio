import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Trash2, ArrowUpDown, Wallet as WalletIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import type { FinanceEntry, Wallet } from "./types"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from "./types"

interface HistorySectionProps {
    entries: FinanceEntry[]
    wallets: Wallet[]
    showAmounts?: boolean
    onDelete: (id: string) => void
}

export function HistorySection({ entries, wallets, showAmounts = true, onDelete }: HistorySectionProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedWallet, setSelectedWallet] = useState("all")
    const [selectedType, setSelectedType] = useState("all") // "all" | "income" | "expense" | "transfer"
    const [datePreset, setDatePreset] = useState("all") // "all" | "this_month" | "last_30" | "last_90" | "custom"
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [visibleCount, setVisibleCount] = useState(25)

    // Filtered and sorted entries
    const filteredEntries = useMemo(() => {
        const now = new Date()

        return entries
            .filter(entry => {
                const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    entry.category.toLowerCase().includes(searchQuery.toLowerCase())
                
                const matchesWallet = selectedWallet === "all" || entry.wallet_id === selectedWallet
                const matchesType = selectedType === "all" 
                    ? true 
                    : selectedType === "transfer" 
                        ? entry.category === "transfer"
                        : entry.type === selectedType

                // Date filter logic
                let matchesDate = true
                const entryTime = new Date(entry.date).getTime()
                if (datePreset === "this_month") {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
                    matchesDate = entryTime >= startOfMonth
                } else if (datePreset === "last_30") {
                    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000
                    matchesDate = entryTime >= thirtyDaysAgo
                } else if (datePreset === "last_90") {
                    const ninetyDaysAgo = now.getTime() - 90 * 24 * 60 * 60 * 1000
                    matchesDate = entryTime >= ninetyDaysAgo
                } else if (datePreset === "custom") {
                    if (startDate && entry.date < startDate) matchesDate = false
                    if (endDate && entry.date > endDate) matchesDate = false
                }

                return matchesSearch && matchesWallet && matchesType && matchesDate
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [entries, searchQuery, selectedWallet, selectedType, datePreset, startDate, endDate])

    // Reset pagination when filter settings change using useEffect instead of useMemo
    useEffect(() => {
        setVisibleCount(25)
    }, [searchQuery, selectedWallet, selectedType, datePreset, startDate, endDate])

    const visibleEntries = useMemo(() => {
        return filteredEntries.slice(0, visibleCount)
    }, [filteredEntries, visibleCount])

    return (
        <div className="space-y-4">
            {/* Filters Header */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search description or category..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Filter Type, Wallet, and Date Range */}
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        {/* Filter Date Range */}
                        <select
                            value={datePreset}
                            onChange={e => setDatePreset(e.target.value)}
                            className="px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="all">🗓️ All Time</option>
                            <option value="this_month">📅 This Month</option>
                            <option value="last_30">⏳ Last 30 Days</option>
                            <option value="last_90">📆 Last 90 Days</option>
                            <option value="custom">✏️ Custom Range</option>
                        </select>

                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="all">All Types</option>
                            <option value="income">➕ Income</option>
                            <option value="expense">➖ Expenses</option>
                            <option value="transfer">🔁 Transfers</option>
                        </select>

                        {/* Filter Wallet */}
                        <select
                            value={selectedWallet}
                            onChange={e => setSelectedWallet(e.target.value)}
                            className="px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-w-[150px] sm:max-w-xs"
                        >
                            <option value="all">All Wallets</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Custom Date Inputs (shown only when datePreset === 'custom') */}
                {datePreset === "custom" && (
                    <div className="flex items-center gap-3 pt-1 text-xs">
                        <span className="font-bold text-muted-foreground">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="px-3 py-1.5 bg-background border border-border/60 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="font-bold text-muted-foreground">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-1.5 bg-background border border-border/60 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate("") }}
                                className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-muted-foreground font-bold rounded-lg transition-all"
                            >
                                Clear Dates
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* History Table/List */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden">
                {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ArrowUpDown className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-bold text-muted-foreground">No transactions found</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Try clearing your filters or logging new items</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {visibleEntries.map((entry, i) => {
                            const isIncome = entry.type === "income"
                            const wallet = wallets.find(w => w.id === entry.wallet_id)
                            const entryCurrency = entry.currency || wallet?.currency || "PHP"
                            
                            // Find matching category details
                            const catDetails = isIncome
                                ? INCOME_CATEGORIES.find(c => c.value === entry.category)
                                : EXPENSE_CATEGORIES.find(c => c.value === entry.category)

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-muted/30 transition-colors group"
                                >
                                    {/* Icon/Emoji Wrapper */}
                                    <span className="text-base sm:text-lg w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-muted/60 rounded-xl shrink-0">
                                        {catDetails?.emoji || "📦"}
                                    </span>

                                    {/* Info details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">
                                            {entry.description || catDetails?.label || entry.category}
                                        </p>
                                        {entry.notes && (
                                            <p className="text-xs text-muted-foreground/80 italic font-normal truncate">{entry.notes}</p>
                                        )}
                                        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-muted-foreground mt-0.5 font-medium">
                                            <span>
                                                {new Date(entry.date).toLocaleDateString("en-PH", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <WalletIcon className="h-3 w-3 inline text-muted-foreground/60" />
                                                {wallet?.name || "Unknown Wallet"}
                                            </span>
                                            <span className="hidden sm:inline">·</span>
                                            {entry.category === "transfer" ? (
                                                <span className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-500 rounded-md text-[10px] font-black uppercase tracking-wide">
                                                    🔁 Wallet Transfer
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 bg-muted rounded-md text-[10px] font-bold uppercase tracking-wide">
                                                    {catDetails?.label || entry.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Value detail */}
                                    <span className={cn(
                                        "text-xs sm:text-sm font-black tabular-nums shrink-0 ml-1",
                                        isIncome ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {isIncome ? "+" : "-"}{formatCurrency(entry.amount, entryCurrency, showAmounts)}
                                    </span>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => {
                                            if (confirm("Are you sure you want to remove this transaction entry?")) {
                                                onDelete(entry.id)
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                        title="Remove transaction"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {filteredEntries.length > visibleCount && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 25)}
                        className="px-4 py-2 bg-card/60 hover:bg-card border border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all shadow-sm"
                    >
                        Load More Transactions ({filteredEntries.length - visibleCount} remaining)
                    </button>
                </div>
            )}
        </div>
    )
}
