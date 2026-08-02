import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, PiggyBank, ArrowDownRight, ArrowUpRight, Trash2, X, AlertTriangle, Calendar, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { SavingsFund, Wallet, CurrencyCode } from "./types"
import { formatCurrency } from "./types"

interface FundsSectionProps {
    funds: SavingsFund[]
    wallets: Wallet[]
    showAmounts?: boolean
    baseCurrency?: CurrencyCode
    onAddFund: (fund: Omit<SavingsFund, "id" | "created_at">) => void
    onFundTransaction: (id: string, amount: number, type: "deposit" | "withdraw", walletId: string, notes: string | null) => void
    onDeleteFund: (id: string) => void
}

export function FundsSection({ funds, wallets, showAmounts = true, baseCurrency = "PHP", onAddFund, onFundTransaction, onDeleteFund }: FundsSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [txModal, setTxModal] = useState<{ fund: SavingsFund; type: "deposit" | "withdraw" } | null>(null)
    const [deleteModal, setDeleteModal] = useState<SavingsFund | null>(null)
    
    // Auto-allocate config state: Record<fundId, percent>
    const [autoAllocates, setAutoAllocates] = useState<Record<string, number>>(() => {
        try {
            const stored = localStorage.getItem("finance_savings_auto_allocate")
            if (stored) return JSON.parse(stored)
        } catch {
            // ignore
        }
        return {}
    })

    const handleSetAutoAllocate = (fundId: string, percent: number) => {
        const updated = { ...autoAllocates, [fundId]: percent }
        if (percent <= 0) delete updated[fundId]
        setAutoAllocates(updated)
        localStorage.setItem("finance_savings_auto_allocate", JSON.stringify(updated))
    }

    const [newFund, setNewFund] = useState({
        label: "",
        target_amount: "",
        current_amount: "",
        target_date: "",
        notes: "",
    })

    const [txForm, setTxForm] = useState({
        amount: "",
        wallet_id: wallets[0]?.id || "",
        notes: "",
    })

    const totalSaved = funds.reduce((sum, f) => sum + f.current_amount, 0)
    const totalTarget = funds.reduce((sum, f) => sum + f.target_amount, 0)

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newFund.label || !newFund.target_amount) return

        onAddFund({
            label: newFund.label,
            target_amount: parseFloat(newFund.target_amount),
            current_amount: parseFloat(newFund.current_amount || "0"),
            target_date: newFund.target_date || null,
            notes: newFund.notes || null,
        })

        setNewFund({ label: "", target_amount: "", current_amount: "", target_date: "", notes: "" })
        setShowAddForm(false)
    }

    const handleOpenTx = (fund: SavingsFund, type: "deposit" | "withdraw") => {
        setTxModal({ fund, type })
        setTxForm({
            amount: "",
            wallet_id: wallets[0]?.id || "",
            notes: type === "deposit"
                ? `Saved to ${fund.label}`
                : `Withdrawn from ${fund.label}`,
        })
    }

    const handleTxSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!txModal || !txForm.amount || !txForm.wallet_id) return

        const amount = parseFloat(txForm.amount)
        if (isNaN(amount) || amount <= 0) return

        if (txModal.type === "withdraw" && (amount > txModal.fund.current_amount || txModal.fund.current_amount <= 0)) {
            alert("Cannot withdraw more than your available saved balance.")
            return
        }

        onFundTransaction(
            txModal.fund.id,
            amount,
            txModal.type,
            txForm.wallet_id,
            txForm.notes || null
        )

        setTxModal(null)
    }

    const selectedWallet = wallets.find(w => w.id === txForm.wallet_id)
    const isOverdraft = txModal?.type === "deposit" && selectedWallet
        ? parseFloat(txForm.amount || "0") > selectedWallet.balance
        : false

    const isExceedingGoalWithdrawal = txModal?.type === "withdraw"
        ? parseFloat(txForm.amount || "0") > txModal.fund.current_amount
        : false

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                        <PiggyBank className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Savings Funds & Goals</h3>
                        <p className="text-xs font-bold text-muted-foreground">
                            Saved: <span className="text-emerald-500">{formatCurrency(totalSaved, baseCurrency, showAmounts)}</span>
                            {totalTarget > 0 && <span className="text-muted-foreground/60 ml-2">of {formatCurrency(totalTarget, baseCurrency, showAmounts)} target</span>}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "font-bold rounded-xl gap-2 transition-all",
                        showAddForm
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                    )}
                    size="sm"
                >
                    {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddForm ? "Cancel" : "New Savings Goal"}
                </Button>
            </div>

            {/* Savings Goal Progress */}
            {totalTarget > 0 && (
                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Goal Completion</span>
                        <span className="text-xs font-black tabular-nums text-emerald-500">
                            {Math.round((totalSaved / totalTarget) * 100)}%
                        </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold tabular-nums text-muted-foreground">
                        <span>Saved: <span className="text-emerald-500">{formatCurrency(totalSaved, baseCurrency, showAmounts)}</span></span>
                        <span>Left: <span className="text-primary">{formatCurrency(Math.max(totalTarget - totalSaved, 0), baseCurrency, showAmounts)}</span></span>
                    </div>
                </div>
            )}

            {/* Add Savings Goal Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleAddSubmit}
                        className="overflow-hidden"
                    >
                        <div className="bg-card/60 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Goal Label / Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Emergency Fund, Travel, Investments"
                                        value={newFund.label}
                                        onChange={e => setNewFund({ ...newFund, label: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Target Savings Amount (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={newFund.target_amount}
                                        onChange={e => setNewFund({ ...newFund, target_amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Starting Saved Amount (₱ - optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newFund.current_amount}
                                        onChange={e => setNewFund({ ...newFund, current_amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Target Date (optional)</label>
                                    <input
                                        type="date"
                                        value={newFund.target_date}
                                        onChange={e => setNewFund({ ...newFund, target_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes / Description (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 6 months worth of expenses"
                                    value={newFund.notes}
                                    onChange={e => setNewFund({ ...newFund, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                Create Savings Goal
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {funds.length === 0 ? (
                    <div className="md:col-span-2 bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl flex flex-col items-center justify-center py-12 text-center">
                        <PiggyBank className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-bold text-muted-foreground">No savings goals created</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Start tracking your Emergency Fund or savings pots today</p>
                    </div>
                ) : (
                    funds.map((fund, index) => {
                        const pct = fund.target_amount > 0 ? (fund.current_amount / fund.target_amount) * 100 : 0
                        const isCompleted = fund.current_amount >= fund.target_amount

                        return (
                            <motion.div
                                key={fund.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "bg-card/60 backdrop-blur-sm border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md border-border/30 hover:shadow-lg transition-all",
                                    isCompleted && "border-emerald-500/30"
                                )}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {isCompleted ? (
                                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center gap-0.5">
                                                        <Check className="h-3 w-3" /> COMPLETED
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
                                                        SAVING
                                                    </span>
                                                )}
                                                {fund.target_date && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(fund.target_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-black text-sm uppercase tracking-tight text-foreground mt-1.5">{fund.label}</h4>
                                            {fund.notes && <p className="text-xs text-muted-foreground/80 mt-1 font-semibold">{fund.notes}</p>}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-muted-foreground block font-bold">Goal: {formatCurrency(fund.target_amount, baseCurrency, showAmounts)}</span>
                                            <span className="text-sm font-black text-emerald-500">{formatCurrency(fund.current_amount, baseCurrency, showAmounts)}</span>
                                        </div>
                                    </div>

                                    {/* Goal progress bar */}
                                    <div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    isCompleted
                                                        ? "bg-emerald-500"
                                                        : pct >= 50
                                                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                            : "bg-emerald-500/80"
                                                )}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] font-bold text-muted-foreground">
                                            <span>{Math.round(pct)}% Saved</span>
                                            <span>Remaining: {formatCurrency(Math.max(fund.target_amount - fund.current_amount, 0), baseCurrency, showAmounts)}</span>
                                        </div>
                                    </div>

                                    {/* Auto-Allocate dropdown selector */}
                                    <div className="flex items-center justify-between pt-1 border-t border-border/10 text-[10px] font-bold text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <span>🎯 Auto-allocate:</span>
                                        </span>
                                        <select
                                            value={autoAllocates[fund.id] || 0}
                                            onChange={e => handleSetAutoAllocate(fund.id, parseInt(e.target.value) || 0)}
                                            className="px-2 py-0.5 bg-background border border-border/40 rounded-md font-bold text-[10px] focus:outline-none"
                                        >
                                            <option value={0}>Off (0%)</option>
                                            <option value={5}>5% of Income</option>
                                            <option value={10}>10% of Income</option>
                                            <option value={15}>15% of Income</option>
                                            <option value={20}>20% of Income</option>
                                            <option value={25}>25% of Income</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-1">
                                    <button
                                        onClick={() => setDeleteModal(fund)}
                                        className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                        title="Delete goal"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="flex gap-1.5">
                                        <Button
                                            onClick={() => handleOpenTx(fund, "withdraw")}
                                            disabled={fund.current_amount <= 0}
                                            className={cn(
                                                "font-bold text-xs h-7 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/30 rounded-lg gap-1",
                                                fund.current_amount <= 0 && "opacity-40 cursor-not-allowed hover:bg-transparent"
                                            )}
                                            size="sm"
                                            title={fund.current_amount <= 0 ? "No funds available to withdraw" : "Withdraw savings"}
                                        >
                                            <ArrowDownRight className="h-3.5 w-3.5" />
                                            Withdraw
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenTx(fund, "deposit")}
                                            className="font-bold text-xs h-7 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg gap-1"
                                            size="sm"
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                            Deposit
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Deposit/Withdraw Modal */}
            <Modal
                isOpen={txModal !== null}
                onClose={() => setTxModal(null)}
                title={txModal ? `${txModal.type === "deposit" ? "Deposit to" : "Withdraw from"} ${txModal.fund.label}` : ""}
                className="max-w-md"
            >
                {txModal && (
                    <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Saved Fund</p>
                            <p className="text-lg font-black tabular-nums text-emerald-500 mt-0.5">{formatCurrency(txModal.fund.current_amount, baseCurrency, showAmounts)}</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount</label>
                            <input
                                type="number"
                                step="any"
                                min="0.01"
                                max={txModal.type === "withdraw" ? txModal.fund.current_amount : undefined}
                                placeholder="0.00"
                                value={txForm.amount}
                                onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                required
                                autoFocus
                            />
                            {isExceedingGoalWithdrawal && (
                                <p className="flex items-center gap-1 text-xs text-rose-500 font-bold mt-1.5">
                                    <AlertTriangle className="h-3 w-3" />
                                    Cannot withdraw more than you have saved.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                {txModal.type === "deposit" ? "Deduct From Wallet" : "Receive In Wallet"}
                            </label>
                            <select
                                value={txForm.wallet_id}
                                onChange={e => setTxForm({ ...txForm, wallet_id: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                required
                            >
                                <option value="">Select wallet...</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance, w.currency || "PHP", showAmounts)})</option>
                                ))}
                            </select>
                            {isOverdraft && (
                                <p className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1.5">
                                    <AlertTriangle className="h-3 w-3" />
                                    This will overdraft your {selectedWallet?.name} wallet.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes / Description (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Monthly allocation, Emergency cash back"
                                value={txForm.notes}
                                onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={!txForm.wallet_id || !txForm.amount || isExceedingGoalWithdrawal}
                            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg"
                        >
                            Confirm {txModal.type === "deposit" ? "Deposit" : "Withdrawal"}
                        </Button>
                    </form>
                )}
            </Modal>

            {/* Delete Fund Confirmation Modal */}
            <Modal
                isOpen={deleteModal !== null}
                onClose={() => setDeleteModal(null)}
                title="Delete Savings Goal"
                className="max-w-md"
            >
                {deleteModal && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-sm font-black uppercase tracking-wider">Warning</p>
                                <p className="text-xs font-semibold">Deleting this savings goal will remove the goal details. The saved funds will NOT be automatically refunded to your wallets. Make sure you withdraw the funds first if needed.</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                            Are you sure you want to delete <span className="text-rose-500 uppercase">"{deleteModal.label}"</span>?
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Saved balance: <span className="font-bold">{formatCurrency(deleteModal.current_amount, baseCurrency, showAmounts)}</span>
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setDeleteModal(null)}
                                className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    onDeleteFund(deleteModal.id)
                                    setDeleteModal(null)
                                }}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20"
                            >
                                Confirm Delete
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
