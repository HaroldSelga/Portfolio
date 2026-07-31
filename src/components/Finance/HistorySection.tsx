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
    const [selectedType, setSelectedType] = useState("all") // "all" | "income" | "expense"
    const [visibleCount, setVisibleCount] = useState(25)

    // Filtered and sorted entries
    const filteredEntries = useMemo(() => {
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

                return matchesSearch && matchesWallet && matchesType
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [entries, searchQuery, selectedWallet, selectedType])

    // Reset pagination when filter settings change using useEffect instead of useMemo
    useEffect(() => {
        setVisibleCount(25)
    }, [searchQuery, selectedWallet, selectedType])

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

                    {/* Filter Type */}
                    <div className="flex gap-2">
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
                                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors group"
                                >
                                    {/* Icon/Emoji Wrapper */}
                                    <span className="text-lg w-10 h-10 flex items-center justify-center bg-muted/60 rounded-xl shrink-0">
                                        {catDetails?.emoji || "📦"}
                                    </span>

                                    {/* Info details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">
                                            {entry.description || catDetails?.label || entry.category}
                                        </p>
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5 font-medium">
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
                                            <span>·</span>
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
                                        "text-sm font-black tabular-nums shrink-0 ml-2",
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
