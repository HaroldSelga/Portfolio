import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Check, Trash2, Receipt, X, Edit2, AlertTriangle, Clock, CalendarDays } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { BillTemplate, Wallet, FinanceEntry, CurrencyCode } from "./types"
import { EXPENSE_CATEGORIES, formatCurrency } from "./types"

interface BillsSectionProps {
    bills: BillTemplate[]
    wallets: Wallet[]
    entries: FinanceEntry[]
    showAmounts?: boolean
    baseCurrency?: CurrencyCode
    onAddBill: (bill: Omit<BillTemplate, "id" | "created_at">) => void
    onUpdateBill: (bill: BillTemplate) => void
    onDeleteBill: (id: string) => void
    onPayBill: (bill: BillTemplate, walletId: string) => void
}

export function BillsSection({ bills, wallets, entries, showAmounts = true, baseCurrency = "PHP", onAddBill, onUpdateBill, onDeleteBill, onPayBill }: BillsSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [payModalBill, setPayModalBill] = useState<BillTemplate | null>(null)
    const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || "")
    const [payAmount, setPayAmount] = useState("")

    const [editModalBill, setEditModalBill] = useState<BillTemplate | null>(null)
    const [editForm, setEditForm] = useState({
        label: "",
        category: "bills",
        amount: "",
        due_day: "",
        penalty_amount: "",
    })

    const [newBill, setNewBill] = useState({
        label: "",
        category: "bills",
        amount: "",
        due_day: "",
        penalty_amount: "",
    })

    // Get current calendar info
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentDay = now.getDate()
    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`

    // Calculate bill status based on transaction history of the current month
    const getBillStatus = (bill: BillTemplate) => {
        // Find if paid this month
        const hasPaid = entries.some(e => {
            const matchesMonth = e.date.startsWith(currentMonthPrefix)
            const matchesType = e.type === "expense"
            // Matches description or label
            const matchesLabel = e.description.toLowerCase().includes(bill.label.toLowerCase())
            const matchesCategory = e.category === bill.category && e.amount === bill.amount
            return matchesMonth && matchesType && (matchesLabel || matchesCategory)
        })

        if (hasPaid) {
            return { status: "paid" as const, daysLeft: 0 }
        }

        if (!bill.due_day) {
            return { status: "unpaid" as const, daysLeft: null }
        }

        const daysLeft = bill.due_day - currentDay

        if (daysLeft < 0) {
            return { status: "overdue" as const, daysLeft }
        } else if (daysLeft <= 5) {
            return { status: "soon" as const, daysLeft }
        } else {
            return { status: "incoming" as const, daysLeft }
        }
    }

    const billStatuses = useMemo(() => {
        return bills.map(bill => ({
            bill,
            info: getBillStatus(bill)
        }))
    }, [bills, entries, currentMonthPrefix, currentDay])

    const unpaidCount = billStatuses.filter(b => b.info.status !== "paid").length
    const overdueCount = billStatuses.filter(b => b.info.status === "overdue").length

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBill.label || !newBill.amount) return

        onAddBill({
            label: newBill.label,
            category: newBill.category,
            amount: parseFloat(newBill.amount),
            due_day: newBill.due_day ? parseInt(newBill.due_day) : null,
            penalty_amount: newBill.penalty_amount ? parseFloat(newBill.penalty_amount) : null,
        })

        setNewBill({
            label: "",
            category: "bills",
            amount: "",
            due_day: "",
            penalty_amount: "",
        })
        setShowAddForm(false)
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editModalBill || !editForm.label || !editForm.amount) return

        onUpdateBill({
            ...editModalBill,
            label: editForm.label,
            category: editForm.category,
            amount: parseFloat(editForm.amount),
            due_day: editForm.due_day ? parseInt(editForm.due_day) : null,
            penalty_amount: editForm.penalty_amount ? parseFloat(editForm.penalty_amount) : null,
        })
        setEditModalBill(null)
    }

    const handlePayConfirm = (e: React.FormEvent) => {
        e.preventDefault()
        if (!payModalBill || !selectedWalletId || !payAmount) return

        onPayBill(
            {
                ...payModalBill,
                amount: parseFloat(payAmount),
            },
            selectedWalletId
        )
        setPayModalBill(null)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                        <Receipt className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Saved Bills</h3>
                        <p className="text-xs font-bold text-muted-foreground">
                            {unpaidCount === 0 ? (
                                <span className="text-emerald-500">🎉 All bills paid for this month!</span>
                            ) : (
                                <span>
                                    Unpaid: <span className="text-amber-500 font-black">{unpaidCount} remaining</span>
                                    {overdueCount > 0 && <span className="text-rose-500 ml-2 font-black">({overdueCount} overdue!)</span>}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "font-bold rounded-xl gap-2 transition-all",
                        showAddForm
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                    )}
                    size="sm"
                >
                    {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddForm ? "Cancel" : "Add Bill"}
                </Button>
            </div>

            {/* Overdue alert banner */}
            {overdueCount > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold shadow-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
                    <div>
                        <span className="font-black uppercase tracking-wider block">Attention</span>
                        <span>You have {overdueCount} bill{overdueCount > 1 ? "s" : ""} past due! Please pay them to avoid penalty charges.</span>
                    </div>
                </div>
            )}

            {/* Add Bill Form */}
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
                        <div className="bg-card/60 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bill Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Internet PLDT, Meralco"
                                        value={newBill.label}
                                        onChange={e => setNewBill({ ...newBill, label: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                                    <select
                                        value={newBill.category}
                                        onChange={e => setNewBill({ ...newBill, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    >
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Standard Amount (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={newBill.amount}
                                        onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Due Day of Month (1-31, optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        placeholder="e.g. 15 for 15th of every month"
                                        value={newBill.due_day}
                                        onChange={e => setNewBill({ ...newBill, due_day: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Late Penalty Fee (₱, optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="e.g. 100 for ₱100 late fee"
                                        value={newBill.penalty_amount}
                                        onChange={e => setNewBill({ ...newBill, penalty_amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-amber-500 text-white hover:bg-amber-600 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                            >
                                Save Bill Template
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Bills List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bills.length === 0 ? (
                    <div className="col-span-full bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl flex flex-col items-center justify-center py-12 text-center">
                        <Receipt className="h-10 w-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-bold text-muted-foreground">No saved bills</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Create bill templates to pay them easily</p>
                    </div>
                ) : (
                    billStatuses.map(({ bill, info }, i) => {
                        const catInfo = EXPENSE_CATEGORIES.find(c => c.value === bill.category)

                        return (
                            <motion.div
                                key={bill.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all group gap-3 shadow-md",
                                    info.status === "overdue" && "border-l-4 border-l-rose-500 border-rose-500/20",
                                    info.status === "soon" && "border-l-4 border-l-amber-500 border-amber-500/20",
                                    info.status === "paid" && "border-l-4 border-l-emerald-500 border-emerald-500/20 opacity-75"
                                )}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl p-2 bg-muted rounded-xl">{catInfo?.emoji || "📱"}</span>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tight text-foreground">{bill.label}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground font-semibold">
                                                <span className="px-1.5 py-0.5 bg-muted rounded-md text-[9px] font-black uppercase">
                                                    {catInfo?.label || bill.category}
                                                </span>
                                                <span>·</span>
                                                <span className="font-bold tabular-nums text-foreground/80">{formatCurrency(bill.amount, baseCurrency, showAmounts)}</span>
                                                {bill.penalty_amount && bill.penalty_amount > 0 && info.status === "overdue" && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="text-rose-500 font-black tabular-nums">+{formatCurrency(bill.penalty_amount, baseCurrency, showAmounts)} penalty</span>
                                                    </>
                                                )}
                                            </div>
                                            {bill.penalty_amount && bill.penalty_amount > 0 && info.status === "overdue" && (
                                                <div className="mt-1 px-2 py-1 bg-rose-500/10 rounded-lg text-[10px] font-bold text-rose-500 tabular-nums">
                                                    ⚠️ Total with penalty: {formatCurrency(bill.amount + bill.penalty_amount, baseCurrency, showAmounts)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {/* Status Badge */}
                                        {info.status === "paid" && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 flex items-center gap-0.5">
                                                <Check className="h-2.5 w-2.5" /> PAID
                                            </span>
                                        )}
                                        {info.status === "overdue" && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-500 flex items-center gap-0.5">
                                                <AlertTriangle className="h-2.5 w-2.5" /> OVERDUE
                                            </span>
                                        )}
                                        {info.status === "soon" && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 flex items-center gap-0.5">
                                                <Clock className="h-2.5 w-2.5" /> DUE SOON
                                            </span>
                                        )}
                                        {info.status === "incoming" && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-muted text-muted-foreground flex items-center gap-0.5">
                                                <CalendarDays className="h-2.5 w-2.5" /> INCOMING
                                            </span>
                                        )}
                                        {bill.due_day && (
                                            <span className="text-[10px] text-muted-foreground font-bold">
                                                Due on Day {bill.due_day}
                                            </span>
                                        )}
                                        {bill.penalty_amount && bill.penalty_amount > 0 && info.status !== "overdue" && (
                                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                                                Late fee: {formatCurrency(bill.penalty_amount, baseCurrency, showAmounts)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-1 w-full">
                                    <button
                                        onClick={() => {
                                            if (confirm(`Are you sure you want to delete the bill template "${bill.label}"?`)) {
                                                onDeleteBill(bill.id)
                                            }
                                        }}
                                        className="p-1 rounded-md text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove bill template"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditModalBill(bill)
                                                setEditForm({
                                                    label: bill.label,
                                                    category: bill.category,
                                                    amount: bill.amount.toString(),
                                                    due_day: bill.due_day ? bill.due_day.toString() : "",
                                                    penalty_amount: bill.penalty_amount ? bill.penalty_amount.toString() : "",
                                                })
                                            }}
                                            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                                            title="Edit bill template"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        {info.status !== "paid" && (
                                            <Button
                                                onClick={() => {
                                                    setPayModalBill(bill)
                                                    const isOverdue = info.status === "overdue"
                                                    const totalWithPenalty = isOverdue && bill.penalty_amount ? bill.amount + bill.penalty_amount : bill.amount
                                                    setPayAmount(totalWithPenalty.toString())
                                                    setSelectedWalletId(wallets[0]?.id || "")
                                                }}
                                                size="sm"
                                                className="h-8 rounded-xl text-xs font-black uppercase bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                                            >
                                                <Check className="h-3 w-3" />
                                                Pay
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Pay Bill Modal */}
            <Modal
                isOpen={payModalBill !== null}
                onClose={() => setPayModalBill(null)}
                title={`Pay Bill — ${payModalBill?.label || ""}`}
                className="max-w-md"
            >
                <form onSubmit={handlePayConfirm} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bill Amount (₱)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                        {payModalBill && payModalBill.penalty_amount && payModalBill.penalty_amount > 0 && getBillStatus(payModalBill).status === "overdue" ? (
                            <div className="mt-2 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 space-y-1">
                                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                                    <span>Base amount</span>
                                    <span className="tabular-nums">{formatCurrency(payModalBill.amount, baseCurrency, showAmounts)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-rose-500">
                                    <span>⚠️ Late penalty</span>
                                    <span className="tabular-nums">+{formatCurrency(payModalBill.penalty_amount, baseCurrency, showAmounts)}</span>
                                </div>
                                <div className="border-t border-rose-500/20 pt-1 flex justify-between text-xs font-black text-foreground">
                                    <span>Total due</span>
                                    <span className="tabular-nums">{formatCurrency(payModalBill.amount + payModalBill.penalty_amount, baseCurrency, showAmounts)}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                                (Modify amount if bill has increased or decreased for this month)
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Pay from Wallet</label>
                        <select
                            value={selectedWalletId}
                            onChange={e => setSelectedWalletId(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        >
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance, w.currency || "PHP", showAmounts)})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            onClick={() => setPayModalBill(null)}
                            className="flex-1 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedWalletId || !payAmount}
                            className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                        >
                            Confirm Payment
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Bill Template Modal */}
            <Modal
                isOpen={editModalBill !== null}
                onClose={() => setEditModalBill(null)}
                title="Edit Bill Template"
                className="max-w-md"
            >
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bill Name</label>
                        <input
                            type="text"
                            value={editForm.label}
                            onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                        <select
                            value={editForm.category}
                            onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.emoji} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Standard Amount (₱)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editForm.amount}
                            onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Due Day of Month (1-31, optional)</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={editForm.due_day}
                            onChange={e => setEditForm({ ...editForm, due_day: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Late Penalty Fee (₱, optional)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 100"
                            value={editForm.penalty_amount}
                            onChange={e => setEditForm({ ...editForm, penalty_amount: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            onClick={() => setEditModalBill(null)}
                            className="flex-1 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-amber-500 text-white hover:bg-amber-600 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
