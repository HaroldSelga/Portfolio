import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, AlertTriangle, Building, Smartphone, Banknote, HelpCircle, Save, X, Star, Globe, RefreshCw } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { Wallet, CategoryBudget, CurrencyCode } from "./types"
import { WALLET_TYPES, WALLET_PRESETS, EXPENSE_CATEGORIES, CURRENCIES, formatCurrency } from "./types"
import {
    getExchangeRates,
    saveCustomExchangeRates,
    savePrimaryBaseCurrency,
    DEFAULT_RATES_IN_USD,
    getDirectRate,
    type ExchangeRates
} from "./currency"

interface SettingsSectionProps {
    wallets: Wallet[]
    budgets: CategoryBudget[]
    rates: ExchangeRates
    customRates: Partial<ExchangeRates>
    baseCurrency: CurrencyCode
    showAmounts?: boolean
    onAddWallet: (wallet: Omit<Wallet, "id" | "created_at">) => void
    onUpdateWallet: (wallet: Wallet) => void
    onDeleteWallet: (id: string) => void
    onAddBudget: (budget: Omit<CategoryBudget, "id" | "created_at">) => void
    onDeleteBudget: (id: string) => void
    onUpdateRates: (rates: ExchangeRates, customRates: Partial<ExchangeRates>) => void
    onUpdateBaseCurrency: (currency: CurrencyCode) => void
}

const WALLET_ICONS: Record<string, React.ElementType> = {
    building: Building,
    smartphone: Smartphone,
    banknote: Banknote,
}

export function SettingsSection({
    wallets,
    budgets,
    rates,
    customRates,
    baseCurrency,
    showAmounts = true,
    onAddWallet,
    onUpdateWallet,
    onDeleteWallet,
    onAddBudget,
    onDeleteBudget,
    onUpdateRates,
    onUpdateBaseCurrency,
}: SettingsSectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [showBudgetForm, setShowBudgetForm] = useState(false)
    const [showRateModal, setShowRateModal] = useState(false)
    const [editWallet, setEditWallet] = useState<Wallet | null>(null)
    const [deleteConfirmWallet, setDeleteConfirmWallet] = useState<Wallet | null>(null)

    const [newWallet, setNewWallet] = useState({
        name: "",
        icon: "building" as "building" | "smartphone" | "banknote",
        currency: "PHP" as CurrencyCode,
        balance: "",
    })

    const [newBudget, setNewBudget] = useState({
        category: "food",
        limit_amount: "",
    })

    const [editForm, setEditForm] = useState({
        name: "",
        icon: "building" as "building" | "smartphone" | "banknote",
        currency: "PHP" as CurrencyCode,
        balance: "",
    })

    // Custom rates editing state
    const [rateInputs, setRateInputs] = useState<Record<string, string>>({})
    const [isRefreshingRates, setIsRefreshingRates] = useState(false)

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWallet.name) return

        onAddWallet({
            name: newWallet.name,
            icon: newWallet.icon,
            currency: newWallet.currency,
            balance: parseFloat(newWallet.balance || "0"),
        })

        setNewWallet({ name: "", icon: "building", currency: "PHP", balance: "" })
        setShowAddForm(false)
    }

    const handleQuickAdd = (preset: { name: string; icon: string; currency?: CurrencyCode }) => {
        onAddWallet({
            name: preset.name,
            icon: preset.icon as any,
            currency: preset.currency || "PHP",
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
            currency: editForm.currency,
            balance: parseFloat(editForm.balance || "0"),
        })

        setEditWallet(null)
    }

    const handleOpenEdit = (wallet: Wallet) => {
        setEditWallet(wallet)
        setEditForm({
            name: wallet.name,
            icon: wallet.icon as any,
            currency: wallet.currency || "PHP",
            balance: wallet.balance.toString(),
        })
    }

    const handleDeleteSubmit = () => {
        if (!deleteConfirmWallet) return
        onDeleteWallet(deleteConfirmWallet.id)
        setDeleteConfirmWallet(null)
    }

    const handleAddBudgetSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBudget.category || !newBudget.limit_amount) return

        onAddBudget({
            category: newBudget.category,
            limit_amount: parseFloat(newBudget.limit_amount),
        })

        setNewBudget({ category: "food", limit_amount: "" })
        setShowBudgetForm(false)
    }

    const handleOpenRateModal = () => {
        const initialInputs: Record<string, string> = {}
        Object.keys(CURRENCIES).forEach(code => {
            const cCode = code as CurrencyCode
            const direct = getDirectRate(cCode, "PHP", rates, customRates)
            initialInputs[cCode] = direct ? direct.toFixed(4) : ""
        })
        setRateInputs(initialInputs)
        setShowRateModal(true)
    }

    const handleRefreshRates = async () => {
        setIsRefreshingRates(true)
        localStorage.removeItem("finance_exchange_rates")
        const freshRates = await getExchangeRates()
        onUpdateRates(freshRates, customRates)
        
        // Update input fields
        const freshInputs: Record<string, string> = {}
        Object.keys(CURRENCIES).forEach(code => {
            const cCode = code as CurrencyCode
            const direct = getDirectRate(cCode, "PHP", freshRates, customRates)
            freshInputs[cCode] = direct ? direct.toFixed(4) : ""
        })
        setRateInputs(freshInputs)
        setIsRefreshingRates(false)
    }

    const handleSaveCustomRates = (e: React.FormEvent) => {
        e.preventDefault()
        const newCustomRates: Partial<ExchangeRates> = { ...customRates }

        Object.entries(rateInputs).forEach(([code, value]) => {
            const cCode = code as CurrencyCode
            const phpVal = parseFloat(value)
            if (cCode === "PHP") return
            if (phpVal > 0) {
                // If 1 NTD = 1.8 PHP, then in USD: USD_rate = PHP_rate_in_USD / 1.8
                const phpInUSD = rates.PHP || DEFAULT_RATES_IN_USD.PHP
                newCustomRates[cCode] = phpInUSD / phpVal
            }
        })

        saveCustomExchangeRates(newCustomRates)
        onUpdateRates(rates, newCustomRates)
        setShowRateModal(false)
    }

    const handleResetCustomRates = () => {
        saveCustomExchangeRates({})
        onUpdateRates(rates, {})
        setShowRateModal(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-stone-500/10 rounded-xl">
                        <Plus className="h-5 w-5 text-stone-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Finance Settings</h3>
                        <p className="text-xs font-bold text-muted-foreground">
                            Multi-currency wallets, live exchange rates, and category budgets
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handleOpenRateModal}
                        className="font-bold rounded-xl gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30"
                        size="sm"
                    >
                        <Globe className="h-4 w-4" />
                        Exchange Rates
                    </Button>
                    <Button
                        onClick={() => setShowBudgetForm(!showBudgetForm)}
                        className={cn(
                            "font-bold rounded-xl gap-2 transition-all",
                            showBudgetForm
                                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                        )}
                        size="sm"
                    >
                        {showBudgetForm ? <X className="h-4 w-4" /> : <Star className="h-4 w-4 text-white" />}
                        {showBudgetForm ? "Cancel" : "Set Budget Limit"}
                    </Button>
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
            </div>

            {/* Base Currency Selector Bar */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-primary" /> Primary Base Currency
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        All portfolio totals and summary reports are aggregated into this currency.
                    </p>
                </div>
                <select
                    value={baseCurrency}
                    onChange={e => {
                        const newCurr = e.target.value as CurrencyCode
                        savePrimaryBaseCurrency(newCurr)
                        onUpdateBaseCurrency(newCurr)
                    }}
                    className="px-3.5 py-2 bg-background border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shrink-0"
                >
                    {Object.values(CURRENCIES).map(curr => (
                        <option key={curr.code} value={curr.code}>
                            {curr.flag} {curr.code} — {curr.name} ({curr.symbol})
                        </option>
                    ))}
                </select>
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
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Wallet / Bank Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BDO, Taiwan Cathay Bank, Binance"
                                        value={newWallet.name}
                                        onChange={e => setNewWallet({ ...newWallet, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Wallet Type</label>
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
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Currency</label>
                                    <select
                                        value={newWallet.currency}
                                        onChange={e => setNewWallet({ ...newWallet, currency: e.target.value as CurrencyCode })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        <optgroup label="Fiat Currencies">
                                            {Object.values(CURRENCIES).filter(c => !c.isCrypto).map(c => (
                                                <option key={c.code} value={c.code}>
                                                    {c.flag} {c.code} ({c.symbol})
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Cryptocurrencies">
                                            {Object.values(CURRENCIES).filter(c => c.isCrypto).map(c => (
                                                <option key={c.code} value={c.code}>
                                                    {c.flag} {c.code} ({c.symbol})
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Starting Balance ({CURRENCIES[newWallet.currency]?.symbol})</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    value={newWallet.balance}
                                    onChange={e => setNewWallet({ ...newWallet, balance: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2 border-t border-border/10 pt-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Suggest Presets:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {WALLET_PRESETS.banks.slice(0, 4).map(p => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => handleQuickAdd({ ...p, currency: "PHP" })}
                                            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                                        >
                                            🏦 {p.name} (PHP)
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleQuickAdd({ name: "Taiwan Bank (NTD)", icon: "building", currency: "NTD" })}
                                        className="px-2 py-1 text-[11px] font-bold rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                                    >
                                        🇹🇼 NTD Bank Wallet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickAdd({ name: "USD Bank Account", icon: "building", currency: "USD" })}
                                        className="px-2 py-1 text-[11px] font-bold rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors"
                                    >
                                        🇺🇸 USD Wallet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickAdd({ name: "Crypto Wallet (BTC)", icon: "smartphone", currency: "BTC" })}
                                        className="px-2 py-1 text-[11px] font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                                    >
                                        🪙 BTC Crypto Wallet
                                    </button>
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

            {/* Set Category Budget Form */}
            <AnimatePresence>
                {showBudgetForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleAddBudgetSubmit}
                        className="overflow-hidden"
                    >
                        <div className="bg-card/60 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Expense Category</label>
                                    <select
                                        value={newBudget.category}
                                        onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        {EXPENSE_CATEGORIES.filter(c => c.value !== "transfer" && c.value !== "savings_deposit").map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block font-sans">
                                        Monthly Limit Amount ({CURRENCIES[baseCurrency]?.symbol})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        placeholder="5000.00"
                                        value={newBudget.limit_amount}
                                        onChange={e => setNewBudget({ ...newBudget, limit_amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                Save Budget Limit
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
                        const currencyCode = wallet.currency || "PHP"
                        const currConfig = CURRENCIES[currencyCode] || CURRENCIES.PHP

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
                                        <div className="min-w-0">
                                            <span className="font-bold text-sm truncate uppercase tracking-tight block">{wallet.name}</span>
                                            <span className="text-[10px] font-black text-muted-foreground">
                                                {currConfig.flag} {currencyCode}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEdit(wallet)}
                                            className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
                                            title="Edit Wallet Settings"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmWallet(wallet)}
                                            className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                            title="Delete Wallet"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="border-t border-border/10 pt-2 flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Balance:</span>
                                    <span className="font-black tabular-nums">{formatCurrency(wallet.balance, currencyCode, showAmounts)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Category Budgets List */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monthly Category Budgets ({budgets.length})</h4>
                {budgets.length === 0 ? (
                    <div className="bg-card/40 border border-border/20 rounded-2xl flex flex-col items-center justify-center py-6 text-center">
                        <Star className="h-8 w-8 text-muted-foreground/20 mb-2" />
                        <p className="text-xs font-bold text-muted-foreground">No budgets configured</p>
                        <p className="text-[10px] text-muted-foreground/60">Set spending limits on Food, Shopping, etc. to get overspend alerts</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {budgets.map(budget => {
                            const catInfo = EXPENSE_CATEGORIES.find(c => c.value === budget.category)
                            return (
                                <div
                                    key={budget.id}
                                    className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex items-center justify-between shadow-md"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-lg p-1.5 bg-muted rounded-xl shrink-0">{catInfo?.emoji || "📦"}</span>
                                        <div className="truncate">
                                            <span className="font-bold text-xs block uppercase tracking-wider text-muted-foreground">Budget</span>
                                            <span className="font-black text-sm uppercase tracking-tight">{catInfo?.label || budget.category}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <span className="font-black text-sm block tabular-nums text-emerald-500">{formatCurrency(budget.limit_amount, baseCurrency, showAmounts)}</span>
                                            <span className="text-[9px] text-muted-foreground font-bold">Limit / month</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete the budget limit for "${catInfo?.label || budget.category}"?`)) {
                                                    onDeleteBudget(budget.id)
                                                }
                                            }}
                                            className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                            title="Delete budget"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
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
                    <div className="grid grid-cols-2 gap-3">
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
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Currency</label>
                            <select
                                value={editForm.currency}
                                onChange={e => setEditForm({ ...editForm, currency: e.target.value as CurrencyCode })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {Object.values(CURRENCIES).map(c => (
                                    <option key={c.code} value={c.code}>
                                        {c.flag} {c.code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Adjust Balance ({CURRENCIES[editForm.currency]?.symbol})</label>
                        <input
                            type="number"
                            step="any"
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

            {/* Exchange Rate Manager Modal */}
            <Modal
                isOpen={showRateModal}
                onClose={() => setShowRateModal(false)}
                title="Manage Exchange Rates (Direct to PHP)"
                className="max-w-lg"
            >
                <form onSubmit={handleSaveCustomRates} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-500 font-medium">
                        <span>Set direct rates relative to 1 Currency = X PHP (e.g. 1 NTD = 1.78 PHP).</span>
                        <button
                            type="button"
                            onClick={handleRefreshRates}
                            disabled={isRefreshingRates}
                            className="p-1 rounded-lg hover:bg-sky-500/20 transition-colors shrink-0 flex items-center gap-1 font-bold"
                            title="Fetch latest live market rates"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshingRates && "animate-spin")} />
                            Sync Live
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.values(CURRENCIES).filter(c => c.code !== "PHP").map(c => {
                            const isCustom = customRates[c.code] !== undefined
                            return (
                                <div key={c.code} className="space-y-1">
                                    <label className="text-[11px] font-black uppercase text-muted-foreground flex justify-between">
                                        <span>{c.flag} 1 {c.code} = (PHP ₱)</span>
                                        {isCustom && <span className="text-amber-500 font-bold">Custom</span>}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₱</span>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0.00"
                                            value={rateInputs[c.code] || ""}
                                            onChange={e => setRateInputs({ ...rateInputs, [c.code]: e.target.value })}
                                            className="w-full pl-7 pr-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/20">
                        <Button
                            type="button"
                            onClick={handleResetCustomRates}
                            className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs"
                        >
                            Reset to Live Rates
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs shadow-lg"
                        >
                            Save Custom Rates
                        </Button>
                    </div>
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
                            <p className="text-xs font-semibold">Deleting a wallet is permanent. All transaction history linked to this wallet will remain in history.</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                        Are you sure you want to delete <span className="text-rose-500 uppercase">"{deleteConfirmWallet?.name}"</span>?
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Current Balance: <span className="font-bold">{deleteConfirmWallet ? formatCurrency(deleteConfirmWallet.balance, deleteConfirmWallet.currency || "PHP", showAmounts) : ""}</span>
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
