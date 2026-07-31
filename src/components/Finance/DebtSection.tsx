import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, CreditCard, ChevronDown, ChevronUp, Check, X, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { Debt, DebtPayment, Wallet, CurrencyCode } from "./types"
import { formatCurrency } from "./types"

interface DebtSectionProps {
    debts: Debt[]
    payments: DebtPayment[]
    wallets: Wallet[]
    showAmounts?: boolean
    baseCurrency?: CurrencyCode
    onAddDebt: (debt: Omit<Debt, "id" | "created_at" | "paid_amount" | "is_settled">) => void
    onAddPayment: (payment: Omit<DebtPayment, "id" | "created_at">) => void
    onDeleteDebt: (id: string) => void
}

export function DebtSection({ debts, payments, wallets, showAmounts = true, baseCurrency = "PHP", onAddDebt, onAddPayment, onDeleteDebt }: DebtSectionProps) {
    const [expandedDebt, setExpandedDebt] = useState<string | null>(null)
    const [showAddDebt, setShowAddDebt] = useState(false)
    const [paymentModal, setPaymentModal] = useState<string | null>(null)
    const [newDebt, setNewDebt] = useState({ label: "", total_amount: "" })
    const [newPayment, setNewPayment] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        notes: "",
        wallet_id: wallets[0]?.id || "",
    })

    const totalDebt = debts.reduce((sum, d) => sum + d.total_amount, 0)
    const totalPaid = debts.reduce((sum, d) => sum + d.paid_amount, 0)
    const totalRemaining = totalDebt - totalPaid

    // Get remaining amount for the debt currently being paid
    const currentDebt = paymentModal ? debts.find(d => d.id === paymentModal) : null
    const currentRemaining = currentDebt ? currentDebt.total_amount - currentDebt.paid_amount : 0
    const paymentAmount = parseFloat(newPayment.amount) || 0
    const isOverpaying = paymentAmount > currentRemaining && currentRemaining > 0
    const selectedWallet = wallets.find(w => w.id === newPayment.wallet_id)
    const isOverdraft = selectedWallet ? paymentAmount > selectedWallet.balance : false

    const handleAddDebt = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newDebt.label || !newDebt.total_amount) return
        onAddDebt({
            label: newDebt.label,
            total_amount: parseFloat(newDebt.total_amount),
        })
        setNewDebt({ label: "", total_amount: "" })
        setShowAddDebt(false)
    }

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!paymentModal || !newPayment.amount || !newPayment.wallet_id) return

        // Prevent overpaying
        const finalAmount = Math.min(paymentAmount, currentRemaining)

        onAddPayment({
            debt_id: paymentModal,
            date: newPayment.date,
            amount: finalAmount,
            notes: newPayment.notes || null,
            wallet_id: newPayment.wallet_id,
        })
        setNewPayment({
            date: new Date().toISOString().split("T")[0],
            amount: "",
            notes: "",
            wallet_id: wallets[0]?.id || "",
        })
        setPaymentModal(null)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl">
                        <CreditCard className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Debts</h3>
                        <p className="text-xs font-bold text-muted-foreground tabular-nums">
                            Remaining: <span className="text-orange-500">{formatCurrency(totalRemaining, baseCurrency, showAmounts)}</span>
                            <span className="text-muted-foreground/60 ml-2">of {formatCurrency(totalDebt, baseCurrency, showAmounts)}</span>
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAddDebt(!showAddDebt)}
                    className={cn(
                        "font-bold rounded-xl gap-2 transition-all",
                        showAddDebt
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                    )}
                    size="sm"
                >
                    {showAddDebt ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddDebt ? "Cancel" : "Add Debt"}
                </Button>
            </div>

            {/* Overall Progress */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Payoff Progress</span>
                    <span className="text-xs font-black tabular-nums text-emerald-500">
                        {totalDebt > 0 ? Math.round((totalPaid / totalDebt) * 100) : 0}%
                    </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs font-bold tabular-nums text-muted-foreground">
                    <span>Paid: <span className="text-emerald-500">{formatCurrency(totalPaid, baseCurrency, showAmounts)}</span></span>
                    <span>Left: <span className="text-orange-500">{formatCurrency(totalRemaining, baseCurrency, showAmounts)}</span></span>
                </div>
            </div>

            {/* Add Debt Form */}
            <AnimatePresence>
                {showAddDebt && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleAddDebt}
                        className="overflow-hidden"
                    >
                        <div className="bg-card/60 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Who / What</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mama, TikTok"
                                        value={newDebt.label}
                                        onChange={e => setNewDebt({ ...newDebt, label: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Total Amount (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={newDebt.total_amount}
                                        onChange={e => setNewDebt({ ...newDebt, total_amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl shadow-lg shadow-orange-500/20"
                            >
                                Add Debt
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Debt Cards */}
            <div className="space-y-3">
                {debts.length === 0 ? (
                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl flex flex-col items-center justify-center py-12 text-center">
                        <CreditCard className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-bold text-muted-foreground">No debts recorded</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Add your debts to track payoff progress</p>
                    </div>
                ) : (
                    debts.map((debt, i) => {
                        const remaining = debt.total_amount - debt.paid_amount
                        const percent = debt.total_amount > 0 ? (debt.paid_amount / debt.total_amount) * 100 : 0
                        const isExpanded = expandedDebt === debt.id
                        const debtPayments = payments
                            .filter(p => p.debt_id === debt.id)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                        return (
                            <motion.div
                                key={debt.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={cn(
                                    "bg-card/60 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all",
                                    debt.is_settled ? "border-emerald-500/30" : "border-border/30"
                                )}
                            >
                                <div className="p-4 space-y-3">
                                    {/* Debt header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {debt.is_settled && (
                                                <div className="p-1 bg-emerald-500/10 rounded-lg">
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                </div>
                                            )}
                                            <h4 className={cn(
                                                "font-black text-sm uppercase tracking-tight",
                                                debt.is_settled && "text-emerald-500 line-through"
                                            )}>
                                                {debt.label}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!debt.is_settled && (
                                                <Button
                                                    onClick={() => {
                                                        setNewPayment({
                                                            date: new Date().toISOString().split("T")[0],
                                                            amount: "",
                                                            notes: "",
                                                            wallet_id: wallets[0]?.id || "",
                                                        })
                                                        setPaymentModal(debt.id)
                                                    }}
                                                    size="sm"
                                                    className="font-bold rounded-lg text-xs h-7 bg-emerald-500 text-white hover:bg-emerald-600 gap-1"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Pay
                                                </Button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to remove debt "${debt.label}"?`)) {
                                                        onDeleteDebt(debt.id)
                                                    }
                                                }}
                                                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                title="Remove debt"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percent, 100)}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    debt.is_settled
                                                        ? "bg-emerald-500"
                                                        : percent >= 75
                                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                            : percent >= 50
                                                                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                                                : "bg-gradient-to-r from-orange-500 to-orange-400"
                                                )}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-xs tabular-nums">
                                            <span className="font-bold text-muted-foreground">
                                                Paid: <span className="text-emerald-500">{formatCurrency(debt.paid_amount, baseCurrency, showAmounts)}</span>
                                            </span>
                                            <span className="font-black text-foreground/80">{Math.round(percent)}%</span>
                                            <span className="font-bold text-muted-foreground">
                                                {debt.is_settled ? (
                                                    <span className="text-emerald-500">Settled ✓</span>
                                                ) : (
                                                    <>Left: <span className="text-orange-500">{formatCurrency(remaining, baseCurrency, showAmounts)}</span></>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment history toggle */}
                                    {debtPayments.length > 0 && (
                                        <button
                                            onClick={() => setExpandedDebt(isExpanded ? null : debt.id)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            {debtPayments.length} payment{debtPayments.length !== 1 ? "s" : ""}
                                        </button>
                                    )}
                                </div>

                                {/* Expanded payment history */}
                                <AnimatePresence>
                                    {isExpanded && debtPayments.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden border-t border-border/20"
                                        >
                                            <div className="divide-y divide-border/20">
                                                {debtPayments.map(p => {
                                                    const pWallet = wallets.find(w => w.id === p.wallet_id)
                                                    return (
                                                        <div key={p.id} className="px-4 py-2.5 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs font-medium text-muted-foreground">
                                                                    {new Date(p.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                                                    {pWallet && (
                                                                        <span className="ml-2 text-muted-foreground/60">via {pWallet.name}</span>
                                                                    )}
                                                                </p>
                                                                {p.notes && <p className="text-xs text-muted-foreground/60 mt-0.5">{p.notes}</p>}
                                                            </div>
                                                            <span className="text-xs font-black tabular-nums text-emerald-500">
                                                                -{formatCurrency(p.amount, pWallet?.currency || "PHP", showAmounts)}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Payment Modal */}
            <Modal
                isOpen={paymentModal !== null}
                onClose={() => setPaymentModal(null)}
                title={`Add Payment — ${debts.find(d => d.id === paymentModal)?.label || ""}`}
                className="max-w-md"
            >
                <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                    {/* Remaining info */}
                    {currentDebt && (
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Remaining Balance</p>
                            <p className="text-lg font-black tabular-nums text-orange-500 mt-0.5">{formatCurrency(currentRemaining, baseCurrency, showAmounts)}</p>
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Date</label>
                        <input
                            type="date"
                            value={newPayment.date}
                            onChange={e => setNewPayment({ ...newPayment, date: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount</label>
                        <input
                            type="number"
                            step="any"
                            min="0.01"
                            max={currentRemaining}
                            placeholder="0.00"
                            value={newPayment.amount}
                            onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                            className={cn(
                                "w-full px-3 py-2 bg-background border rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2",
                                isOverpaying
                                    ? "border-amber-500 focus:ring-amber-500/20 focus:border-amber-500"
                                    : "border-border/60 focus:ring-emerald-500/20 focus:border-emerald-500"
                            )}
                            required
                            autoFocus
                        />
                        {isOverpaying && (
                            <p className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1.5">
                                <AlertTriangle className="h-3 w-3" />
                                Amount exceeds remaining ({formatCurrency(currentRemaining, baseCurrency, showAmounts)}). Will be capped automatically.
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Deduct From Wallet</label>
                        <select
                            value={newPayment.wallet_id}
                            onChange={e => setNewPayment({ ...newPayment, wallet_id: e.target.value })}
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
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Partial payment via GCash"
                            value={newPayment.notes}
                            onChange={e => setNewPayment({ ...newPayment, notes: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!newPayment.wallet_id}
                        className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                        Confirm Payment
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
