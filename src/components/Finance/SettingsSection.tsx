import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, AlertTriangle, Building, Smartphone, Banknote, HelpCircle, Save, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { Wallet } from "./types"
import { WALLET_TYPES, WALLET_PRESETS } from "./types"

interface SettingsSectionProps {
    wallets: Wallet[]
    onAddWallet: (wallet: Omit<Wallet, "id" | "created_at">) => void
    onUpdateWallet: (wallet: Wallet) => void
    onDeleteWallet: (id: string) => void
}

const WALLET_ICONS: Record<string, React.ElementType> = {
    building: Building,
    smartphone: Smartphone,
    banknote: Banknote,
}

function formatPeso(amount: number): string {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function SettingsSection({ wallets, onAddWallet, onUpdateWallet, onDeleteWallet }: SettingsSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [editWallet, setEditWallet] = useState<Wallet | null>(null)
    const [deleteConfirmWallet, setDeleteConfirmWallet] = useState<Wallet | null>(null)

    const [newWallet, setNewWallet] = useState({
        name: "",
        icon: "building" as "building" | "smartphone" | "banknote",
        balance: "",
    })

    const [editForm, setEditForm] = useState({
        name: "",
        icon: "building" as "building" | "smartphone" | "banknote",
        balance: "", // Normally edit balance isn't manual, but let's allow it in settings
    })

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWallet.name) return

        onAddWallet({
            name: newWallet.name,
            icon: newWallet.icon,
            balance: parseFloat(newWallet.balance || "0"),
        })

        setNewWallet({ name: "", icon: "building", balance: "" })
        setShowAddForm(false)
    }

    const handleQuickAdd = (preset: { name: string; icon: string }) => {
        // Quick add with ₱0 balance
        onAddWallet({
            name: preset.name,
            icon: preset.icon as any,
            balance: 0,
        })
    }

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editWallet || !editForm.name) return

        onUpdateWallet({
            ...editWallet,
            name: editForm.name,
            icon: editForm.icon,
            balance: parseFloat(editForm.balance || "0"),
        })

        setEditWallet(null)
    }

    const handleOpenEdit = (wallet: Wallet) => {
        setEditWallet(wallet)
        setEditForm({
            name: wallet.name,
            icon: wallet.icon as any,
            balance: wallet.balance.toString(),
        })
    }

    const handleDeleteSubmit = () => {
        if (!deleteConfirmWallet) return
        onDeleteWallet(deleteConfirmWallet.id)
        setDeleteConfirmWallet(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-stone-500/10 rounded-xl">
                        <Plus className="h-5 w-5 text-stone-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Finance Settings</h3>
                        <p className="text-xs font-bold text-muted-foreground">
                            Manage your cash, bank accounts, and e-wallets
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "font-bold rounded-xl gap-2 transition-all",
                        showAddForm
                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10"
                    )}
                    size="sm"
                >
                    {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddForm ? "Cancel" : "Add Wallet"}
                </Button>
            </div>

            {/* Add Wallet Form */}
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
                        <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block font-sans">Wallet / Bank Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BDO, EastWest, Maya"
                                        value={newWallet.name}
                                        onChange={e => setNewWallet({ ...newWallet, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block font-sans">Wallet Type</label>
                                    <select
                                        value={newWallet.icon}
                                        onChange={e => setNewWallet({ ...newWallet, icon: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        {WALLET_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>
                                                {t.emoji} {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block font-sans">Starting Balance (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newWallet.balance}
                                        onChange={e => setNewWallet({ ...newWallet, balance: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Preset Suggesions */}
                            <div className="space-y-2 border-t border-border/10 pt-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Suggest Preset Names (₱0 start):</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {WALLET_PRESETS.banks.slice(0, 4).map(p => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => handleQuickAdd(p)}
                                            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                                        >
                                            🏦 {p.name}
                                        </button>
                                    ))}
                                    {WALLET_PRESETS.ewallets.slice(0, 3).map(p => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => handleQuickAdd(p)}
                                            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                                        >
                                            📱 {p.name}
                                        </button>
                                    ))}
                                    {WALLET_PRESETS.cash.slice(0, 1).map(p => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => handleQuickAdd(p)}
                                            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                                        >
                                            💵 {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold rounded-xl shadow-lg shadow-primary/10"
                            >
                                Create Wallet
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Wallet Management Grid */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Wallets ({wallets.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {wallets.map(wallet => {
                        const IconComponent = WALLET_ICONS[wallet.icon] || HelpCircle
                        return (
                            <div
                                key={wallet.id}
                                className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex flex-col justify-between shadow-md"
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-2 bg-muted rounded-xl shrink-0">
                                            <IconComponent className="h-4.5 w-4.5 text-muted-foreground" />
                                        </div>
                                        <span className="font-bold text-sm truncate uppercase tracking-tight">{wallet.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEdit(wallet)}
                                            className="p-1 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                                            title="Edit Wallet Settings"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmWallet(wallet)}
                                            className="p-1 rounded-lg text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                            title="Delete Wallet"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="border-t border-border/10 pt-2 flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Balance:</span>
                                    <span className="font-black tabular-nums">{formatPeso(wallet.balance)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Quick-Add Presets Panel */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/20 rounded-2xl p-4 space-y-4">
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">Need to Add More?</h4>
                    <p className="text-xs text-muted-foreground">Select popular presets to add wallets in one click.</p>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-muted-foreground/70">🏦 Banks</span>
                        <div className="flex flex-wrap gap-1">
                            {WALLET_PRESETS.banks.map(p => {
                                const exists = wallets.some(w => w.name.toLowerCase() === p.name.toLowerCase())
                                return (
                                    <button
                                        key={p.name}
                                        onClick={() => !exists && handleQuickAdd(p)}
                                        disabled={exists}
                                        className={cn(
                                            "px-2.5 py-1 text-xs rounded-xl border font-bold flex items-center gap-1 transition-all",
                                            exists
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-not-allowed"
                                                : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                                        )}
                                    >
                                        {exists && <Check className="h-3 w-3" />}
                                        {p.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-muted-foreground/70">📱 E-Wallets</span>
                        <div className="flex flex-wrap gap-1">
                            {WALLET_PRESETS.ewallets.map(p => {
                                const exists = wallets.some(w => w.name.toLowerCase() === p.name.toLowerCase())
                                return (
                                    <button
                                        key={p.name}
                                        onClick={() => !exists && handleQuickAdd(p)}
                                        disabled={exists}
                                        className={cn(
                                            "px-2.5 py-1 text-xs rounded-xl border font-bold flex items-center gap-1 transition-all",
                                            exists
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-not-allowed"
                                                : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                                        )}
                                    >
                                        {exists && <Check className="h-3 w-3" />}
                                        {p.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-muted-foreground/70">💵 Cash Presets</span>
                        <div className="flex flex-wrap gap-1">
                            {WALLET_PRESETS.cash.map(p => {
                                const exists = wallets.some(w => w.name.toLowerCase() === p.name.toLowerCase())
                                return (
                                    <button
                                        key={p.name}
                                        onClick={() => !exists && handleQuickAdd(p)}
                                        disabled={exists}
                                        className={cn(
                                            "px-2.5 py-1 text-xs rounded-xl border font-bold flex items-center gap-1 transition-all",
                                            exists
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-not-allowed"
                                                : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
                                        )}
                                    >
                                        {exists && <Check className="h-3 w-3" />}
                                        {p.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Wallet Modal */}
            <Modal
                isOpen={editWallet !== null}
                onClose={() => setEditWallet(null)}
                title={`Edit Wallet — ${editWallet?.name || ""}`}
                className="max-w-md"
            >
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Wallet Name</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Icon Type</label>
                        <select
                            value={editForm.icon}
                            onChange={e => setEditForm({ ...editForm, icon: e.target.value as any })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                            {WALLET_TYPES.map(t => (
                                <option key={t.value} value={t.value}>
                                    {t.emoji} {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Adjust Balance (₱)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editForm.balance}
                            onChange={e => setEditForm({ ...editForm, balance: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold rounded-xl shadow-lg"
                    >
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteConfirmWallet !== null}
                onClose={() => setDeleteConfirmWallet(null)}
                title="Delete Wallet"
                className="max-w-md"
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-wider">Warning</p>
                            <p className="text-xs font-semibold">Deleting a wallet is permanent. All transaction history linked to this wallet will remain in history but will no longer point to this wallet.</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                        Are you sure you want to delete <span className="text-rose-500 uppercase">"{deleteConfirmWallet?.name}"</span>?
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Current Balance: <span className="font-bold">{deleteConfirmWallet ? formatPeso(deleteConfirmWallet.balance) : ""}</span>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setDeleteConfirmWallet(null)}
                            className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteSubmit}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20"
                        >
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
