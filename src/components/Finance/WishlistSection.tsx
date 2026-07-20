import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, Check, Trash2, X, AlertTriangle, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { WishlistItem, Wallet } from "./types"

interface WishlistSectionProps {
    items: WishlistItem[]
    wallets: Wallet[]
    onAddItem: (item: Omit<WishlistItem, "id" | "created_at" | "is_purchased" | "actual_price" | "purchased_date" | "wallet_id">) => void
    onPurchaseItem: (id: string, actualPrice: number, walletId: string, notes: string | null, date: string) => void
    onDeleteItem: (id: string) => void
}

function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function WishlistSection({ items, wallets, onAddItem, onPurchaseItem, onDeleteItem }: WishlistSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [purchaseModalItem, setPurchaseModalItem] = useState<WishlistItem | null>(null)
    const [newWishlist, setNewWishlist] = useState({
        label: "",
        estimated_price: "",
        priority: "medium" as "low" | "medium" | "high",
        notes: "",
        target_date: "",
    })

    const [purchaseForm, setPurchaseForm] = useState({
        actual_price: "",
        wallet_id: wallets[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
    })

    const activeItems = items.filter(item => !item.is_purchased)
    const purchasedItems = items.filter(item => item.is_purchased)

    const totalEstimatedActive = activeItems.reduce((sum, item) => sum + item.estimated_price, 0)
    const totalActualPurchased = purchasedItems.reduce((sum, item) => sum + (item.actual_price || 0), 0)

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWishlist.label || !newWishlist.estimated_price) return

        onAddItem({
            label: newWishlist.label,
            estimated_price: parseFloat(newWishlist.estimated_price),
            priority: newWishlist.priority,
            notes: newWishlist.notes || null,
            target_date: newWishlist.target_date || null,
        })

        setNewWishlist({
            label: "",
            estimated_price: "",
            priority: "medium",
            notes: "",
            target_date: "",
        })
        setShowAddForm(false)
    }

    const handleOpenPurchase = (item: WishlistItem) => {
        setPurchaseModalItem(item)
        setPurchaseForm({
            actual_price: item.estimated_price.toString(),
            wallet_id: wallets[0]?.id || "",
            date: new Date().toISOString().split("T")[0],
            notes: item.notes ? `Wishlist: ${item.notes}` : `Wishlist Purchase: ${item.label}`,
        })
    }

    const handlePurchaseSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!purchaseModalItem || !purchaseForm.actual_price || !purchaseForm.wallet_id) return

        onPurchaseItem(
            purchaseModalItem.id,
            parseFloat(purchaseForm.actual_price),
            purchaseForm.wallet_id,
            purchaseForm.notes || null,
            purchaseForm.date
        )

        setPurchaseModalItem(null)
    }

    const selectedWallet = wallets.find(w => w.id === purchaseForm.wallet_id)
    const isOverdraft = selectedWallet ? parseFloat(purchaseForm.actual_price || "0") > selectedWallet.balance : false

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/10 rounded-xl">
                        <Target className="h-5 w-5 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Wishlist / Buy Soon</h3>
                        <p className="text-xs font-bold text-muted-foreground">
                            Estimated: <span className="text-sky-500">{formatPeso(totalEstimatedActive)}</span> remaining
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "font-bold rounded-xl gap-2 transition-all",
                        showAddForm
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20"
                    )}
                    size="sm"
                >
                    {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddForm ? "Cancel" : "Add Item"}
                </Button>
            </div>

            {/* Add Wishlist Item Form */}
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
                        <div className="bg-card/60 backdrop-blur-sm border border-sky-500/20 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">What do you plan to buy?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Phone for Mama, Laptop, Shoes"
                                        value={newWishlist.label}
                                        onChange={e => setNewWishlist({ ...newWishlist, label: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Estimated Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={newWishlist.estimated_price}
                                        onChange={e => setNewWishlist({ ...newWishlist, estimated_price: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Priority</label>
                                    <select
                                        value={newWishlist.priority}
                                        onChange={e => setNewWishlist({ ...newWishlist, priority: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                    >
                                        <option value="low">🟢 Low</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="high">🔴 High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Target Purchase Date (optional)</label>
                                    <input
                                        type="date"
                                        value={newWishlist.target_date}
                                        onChange={e => setNewWishlist({ ...newWishlist, target_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes / Description (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Birthday gift, needs 8GB RAM, specs..."
                                    value={newWishlist.notes}
                                    onChange={e => setNewWishlist({ ...newWishlist, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-sky-500 text-white hover:bg-sky-600 font-bold rounded-xl shadow-lg shadow-sky-500/20"
                            >
                                Add to Bucket List
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Items */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Planning to Buy Soon ({activeItems.length})</h4>
                    {activeItems.length === 0 ? (
                        <div className="bg-card/40 border border-border/20 rounded-2xl flex flex-col items-center justify-center py-10 text-center">
                            <Target className="h-8 w-8 text-muted-foreground/20 mb-2" />
                            <p className="text-xs font-bold text-muted-foreground">No planned purchases</p>
                        </div>
                    ) : (
                        activeItems.map(item => (
                            <div
                                key={item.id}
                                className={cn(
                                    "bg-card/60 backdrop-blur-sm border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md border-border/30 hover:shadow-lg transition-all",
                                    item.priority === "high" ? "border-l-4 border-l-rose-500" :
                                    item.priority === "medium" ? "border-l-4 border-l-amber-500" :
                                    "border-l-4 border-l-emerald-500"
                                )}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md",
                                                item.priority === "high" ? "bg-rose-500/10 text-rose-500" :
                                                item.priority === "medium" ? "bg-amber-500/10 text-amber-500" :
                                                "bg-emerald-500/10 text-emerald-500"
                                            )}>
                                                {item.priority} Priority
                                            </span>
                                            {item.target_date && (
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(item.target_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="font-black text-sm uppercase tracking-tight text-foreground mt-1.5">
                                            {item.label}
                                        </h5>
                                        {item.notes && <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{item.notes}</p>}
                                    </div>
                                    <span className="text-sm font-black tabular-nums text-foreground">
                                        {formatPeso(item.estimated_price)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-end gap-2 border-t border-border/10 pt-3 mt-1">
                                    <button
                                        onClick={() => onDeleteItem(item.id)}
                                        className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                        title="Remove item"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <Button
                                        onClick={() => handleOpenPurchase(item)}
                                        className="font-bold text-xs h-8 bg-sky-500 text-white hover:bg-sky-600 rounded-xl gap-1.5"
                                        size="sm"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        Mark as Bought
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Purchased Items */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Bought / Completed ({purchasedItems.length})</h4>
                    {purchasedItems.length === 0 ? (
                        <div className="bg-card/40 border border-border/20 rounded-2xl flex flex-col items-center justify-center py-10 text-center">
                            <Check className="h-8 w-8 text-muted-foreground/20 mb-2" />
                            <p className="text-xs font-bold text-muted-foreground">No purchases recorded yet</p>
                        </div>
                    ) : (
                        purchasedItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-card/30 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-sm opacity-80"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                                                <Check className="h-3 w-3" /> BOUGHT
                                            </span>
                                            {item.purchased_date && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    on {new Date(item.purchased_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            )}
                                        </div>
                                        <h5 className="font-bold text-sm uppercase tracking-tight text-muted-foreground mt-1.5 line-through">
                                            {item.label}
                                        </h5>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground line-through block font-medium">Est: {formatPeso(item.estimated_price)}</span>
                                        <span className="text-sm font-black tabular-nums text-emerald-500">
                                            Paid: {formatPeso(item.actual_price || 0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-border/10 pt-2.5 mt-1 text-[11px] text-muted-foreground/75 font-semibold">
                                    <span>
                                        Wallet: {wallets.find(w => w.id === item.wallet_id)?.name || "Unknown"}
                                    </span>
                                    <button
                                        onClick={() => onDeleteItem(item.id)}
                                        className="p-1 rounded-md text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                        title="Delete wishlist record"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Purchase Confirmation Modal */}
            <Modal
                isOpen={purchaseModalItem !== null}
                onClose={() => setPurchaseModalItem(null)}
                title={`Mark Bought — ${purchaseModalItem?.label || ""}`}
                className="max-w-md"
            >
                <form onSubmit={handlePurchaseSubmit} className="p-6 space-y-4">
                    <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Cost</p>
                        <p className="text-lg font-black tabular-nums text-sky-500 mt-0.5">
                            {purchaseModalItem ? formatPeso(purchaseModalItem.estimated_price) : ""}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Actual Amount Paid (₱)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={purchaseForm.actual_price}
                            onChange={e => setPurchaseForm({ ...purchaseForm, actual_price: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Pay From Wallet</label>
                        <select
                            value={purchaseForm.wallet_id}
                            onChange={e => setPurchaseForm({ ...purchaseForm, wallet_id: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            required
                        >
                            <option value="">Select wallet...</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({formatPeso(w.balance)})</option>
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
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Purchase Date</label>
                        <input
                            type="date"
                            value={purchaseForm.date}
                            onChange={e => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Transaction Notes / Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Bought at Mall with discount"
                            value={purchaseForm.notes}
                            onChange={e => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={!purchaseForm.wallet_id || !purchaseForm.actual_price}
                        className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                        Confirm Purchase
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
