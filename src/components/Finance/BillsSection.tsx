import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Check, Trash2, Receipt, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { BillTemplate, Wallet } from "./types"
import { EXPENSE_CATEGORIES } from "./types"

interface BillsSectionProps {
    bills: BillTemplate[]
    wallets: Wallet[]
    onAddBill: (bill: Omit<BillTemplate, "id" | "created_at">) => void
    onDeleteBill: (id: string) => void
    onPayBill: (bill: BillTemplate, walletId: string) => void
}

function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function BillsSection({ bills, wallets, onAddBill, onDeleteBill, onPayBill }: BillsSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [payModalBill, setPayModalBill] = useState<BillTemplate | null>(null)
    const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || "")

    const [newBill, setNewBill] = useState({
        label: "",
        category: "bills",
        amount: "",
    })

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBill.label || !newBill.amount) return

        onAddBill({
            label: newBill.label,
            category: newBill.category,
            amount: parseFloat(newBill.amount),
        })

        setNewBill({
            label: "",
            category: "bills",
            amount: "",
        })
        setShowAddForm(false)
    }

    const handlePayConfirm = (e: React.FormEvent) => {
        e.preventDefault()
        if (!payModalBill || !selectedWalletId) return

        onPayBill(payModalBill, selectedWalletId)
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
                            Quickly log recurring bills as expenses
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Bill Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Internet PLDT"
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
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Amount (₱)</label>
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
                    bills.map((bill, i) => {
                        const catInfo = EXPENSE_CATEGORIES.find(c => c.value === bill.category)

                        return (
                            <motion.div
                                key={bill.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl p-2 bg-muted rounded-xl">{catInfo?.emoji || "📱"}</span>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{bill.label}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground font-medium">
                                            <span className="px-1.5 py-0.5 bg-muted rounded-md text-[10px] font-bold uppercase">
                                                {catInfo?.label || bill.category}
                                            </span>
                                            <span>·</span>
                                            <span className="font-bold tabular-nums text-foreground/80">{formatPeso(bill.amount)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            setPayModalBill(bill)
                                            setSelectedWalletId(wallets[0]?.id || "")
                                        }}
                                        size="sm"
                                        className="h-8 rounded-lg text-xs font-black uppercase bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                                    >
                                        <Check className="h-3 w-3" />
                                        Pay
                                    </Button>
                                    <button
                                        onClick={() => onDeleteBill(bill.id)}
                                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove bill template"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
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
                    <div className="bg-muted/30 border border-border/40 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Bill Amount</span>
                            <span className="text-lg font-black text-foreground">{payModalBill ? formatPeso(payModalBill.amount) : "₱0.00"}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Category</span>
                            <span className="text-sm font-bold text-foreground">
                                {EXPENSE_CATEGORIES.find(c => c.value === payModalBill?.category)?.label || payModalBill?.category}
                            </span>
                        </div>
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
                                <option key={w.id} value={w.id}>{w.name} ({formatPeso(w.balance)})</option>
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
                            disabled={!selectedWalletId}
                            className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                        >
                            Confirm Payment
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
