import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, AlertTriangle, Building, Smartphone, Banknote, HelpCircle, Save, X, Star, Globe, RefreshCw, Calculator, Calendar as CalendarIcon, DollarSign, ChevronDown, ChevronUp, Check, RotateCcw, Download } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { Wallet, CategoryBudget, CurrencyCode, WorkProfile, PayrollDeduction, FinanceEntry, Debt, DebtPayment, BillTemplate, WishlistItem, SavingsFund, TimeLog } from "./types"
import { WALLET_TYPES, WALLET_PRESETS, EXPENSE_CATEGORIES, CURRENCIES, formatCurrency } from "./types"
import {
    getExchangeRates,
    saveCustomExchangeRates,
    savePrimaryBaseCurrency,
    DEFAULT_RATES_IN_USD,
    getDirectRate,
    type ExchangeRates
} from "./currency"
import {
    getComputationConfig,
    saveComputationConfig,
    resetComputationConfig,
    DEFAULT_COMPUTATION_CONFIG,
    type ComputationConfig
} from "./computationConfig"
import {
    getCustomHolidays,
    addCustomHoliday,
    deleteCustomHoliday,
    getAllHolidays,
    type Holiday
} from "./holidays"

interface SettingsSectionProps {
    wallets: Wallet[]
    budgets: CategoryBudget[]
    rates: ExchangeRates
    customRates: Partial<ExchangeRates>
    baseCurrency: CurrencyCode
    showAmounts?: boolean
    profiles?: WorkProfile[]
    deductions?: PayrollDeduction[]
    entries?: FinanceEntry[]
    debts?: Debt[]
    payments?: DebtPayment[]
    bills?: BillTemplate[]
    wishlist?: WishlistItem[]
    funds?: SavingsFund[]
    timeLogs?: TimeLog[]
    onAddWallet: (wallet: Omit<Wallet, "id" | "created_at">) => void
    onUpdateWallet: (wallet: Wallet) => void
    onDeleteWallet: (id: string) => void
    onAddBudget: (budget: Omit<CategoryBudget, "id" | "created_at">) => void
    onDeleteBudget: (id: string) => void
    onUpdateRates: (rates: ExchangeRates, customRates: Partial<ExchangeRates>) => void
    onUpdateBaseCurrency: (currency: CurrencyCode) => void
    onAddDeduction?: (deduction: Omit<PayrollDeduction, "id" | "created_at">) => void
    onDeleteDeduction?: (id: string) => void
    onToggleDeduction?: (id: string) => void
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
    profiles = [],
    deductions = [],
    onAddWallet,
    onUpdateWallet,
    onDeleteWallet,
    onAddBudget,
    onDeleteBudget,
    onUpdateRates,
    onUpdateBaseCurrency,
    onAddDeduction,
    onDeleteDeduction,
    onToggleDeduction,
    entries = [],
    debts = [],
    payments = [],
    bills = [],
    wishlist = [],
    funds = [],
    timeLogs = []
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

    // Computation Config State
    const [compConfig, setCompConfig] = useState<ComputationConfig>(() => getComputationConfig())
    const [compNotice, setCompNotice] = useState<string | null>(null)
    const [showCompSection, setShowCompSection] = useState(false)

    // Holiday Manager State
    const [showHolidaySection, setShowHolidaySection] = useState(false)
    const [customHolidays, setCustomHolidays] = useState<Holiday[]>(() => getCustomHolidays())
    const [newHoliday, setNewHoliday] = useState({
        date: "",
        name: "",
        country: "TW" as "TW" | "PH",
        type: "regular_holiday" as "regular_holiday" | "special_holiday"
    })
    const [holidayCountryFilter, setHolidayCountryFilter] = useState<"TW" | "PH">("TW")

    // Recurring Deductions State
    const [showDeductionSection, setShowDeductionSection] = useState(false)
    const [selectedDeductionProfileId, setSelectedDeductionProfileId] = useState<string>(() => profiles[0]?.id || "")
    const [newDeduction, setNewDeduction] = useState({
        label: "",
        amount: "",
        frequency: "kinsenas" as "monthly" | "kinsenas"
    })

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
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Finance Settings</h3>
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

            {/* ═══════════════════════════════════════════ */}
            {/* ⚙️ COMPUTATION CONSTANTS (Editable Tax & Multipliers) */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-md">
                <div
                    onClick={() => setShowCompSection(!showCompSection)}
                    className="flex items-center justify-between cursor-pointer select-none"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Calculator className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-tight">Computation Constants & Rates</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Customize OT multipliers, night pay, tax withholding, and legal benchmark hours</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-xl">
                        {showCompSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {showCompSection && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-3 border-t border-border/20 overflow-hidden"
                        >
                            {compNotice && (
                                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <Check className="h-4 w-4" /> {compNotice}
                                </div>
                            )}

                            {/* 🇹🇼 TAIWAN COMPUTATION SETTINGS */}
                            <div className="space-y-2">
                                <h5 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    🇹🇼 Taiwan Constants (勞基法)
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">OT Tier 1 (1st 2hrs)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={compConfig.tw.otTier1Multiplier}
                                            onChange={e => setCompConfig({ ...compConfig, tw: { ...compConfig.tw, otTier1Multiplier: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">OT Tier 2 (Next 2hrs)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={compConfig.tw.otTier2Multiplier}
                                            onChange={e => setCompConfig({ ...compConfig, tw: { ...compConfig.tw, otTier2Multiplier: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Rest Day OT Tier 2 (Hrs 11+)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={compConfig.tw.restDayOtTier2}
                                            onChange={e => setCompConfig({ ...compConfig, tw: { ...compConfig.tw, restDayOtTier2: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Night Pay (NT$/hr)</label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={compConfig.tw.nightDifferentialFlat}
                                            onChange={e => setCompConfig({ ...compConfig, tw: { ...compConfig.tw, nightDifferentialFlat: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Tax Withholding Rate (%)</label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={Math.round(compConfig.tw.withholdingRate * 100)}
                                            onChange={e => setCompConfig({ ...compConfig, tw: { ...compConfig.tw, withholdingRate: (parseFloat(e.target.value) || 0) / 100 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Monthly Divisor (Hours)</label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={compConfig.tw.monthlySalaryDivisor}
                                            onChange={e => setCompConfig({ ...compConfig, tw: { ...compConfig.tw, monthlySalaryDivisor: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 🇵🇭 PHILIPPINES COMPUTATION SETTINGS */}
                            <div className="space-y-2 pt-2 border-t border-border/10">
                                <h5 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    🇵🇭 Philippines Constants (DOLE & TRAIN)
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Regular Day OT Multiplier</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={compConfig.ph.otMultiplier}
                                            onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, otMultiplier: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Rest Day Multiplier</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={compConfig.ph.restDayBase}
                                            onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, restDayBase: parseFloat(e.target.value) || 0 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Night Differential (%)</label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={Math.round(compConfig.ph.nightDifferentialPercent * 100)}
                                            onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, nightDifferentialPercent: (parseFloat(e.target.value) || 0) / 100 } })}
                                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">SSS Rate (%) & Monthly Cap (₱)</label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={compConfig.ph.sssRate * 100}
                                                onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, sssRate: (parseFloat(e.target.value) || 0) / 100 } })}
                                                className="px-2 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                                placeholder="%"
                                            />
                                            <input
                                                type="number"
                                                step="50"
                                                value={compConfig.ph.sssMonthyCap}
                                                onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, sssMonthyCap: parseFloat(e.target.value) || 0 } })}
                                                className="px-2 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                                placeholder="Cap ₱"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">PhilHealth Rate (%) & Cap (₱)</label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={compConfig.ph.philHealthRate * 100}
                                                onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, philHealthRate: (parseFloat(e.target.value) || 0) / 100 } })}
                                                className="px-2 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                                placeholder="%"
                                            />
                                            <input
                                                type="number"
                                                step="50"
                                                value={compConfig.ph.philHealthMonthlyCap}
                                                onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, philHealthMonthlyCap: parseFloat(e.target.value) || 0 } })}
                                                className="px-2 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                                placeholder="Cap ₱"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground block uppercase">Pag-IBIG Rate (%) & Cap (₱)</label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={compConfig.ph.pagIbigRate * 100}
                                                onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, pagIbigRate: (parseFloat(e.target.value) || 0) / 100 } })}
                                                className="px-2 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                                placeholder="%"
                                            />
                                            <input
                                                type="number"
                                                step="50"
                                                value={compConfig.ph.pagIbigMonthlyCap}
                                                onChange={e => setCompConfig({ ...compConfig, ph: { ...compConfig.ph, pagIbigMonthlyCap: parseFloat(e.target.value) || 0 } })}
                                                className="px-2 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                                placeholder="Cap ₱"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-border/20">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        resetComputationConfig()
                                        setCompConfig({ ...DEFAULT_COMPUTATION_CONFIG })
                                        setCompNotice("Restored default legal computation rates!")
                                        setTimeout(() => setCompNotice(null), 4000)
                                    }}
                                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset to Legal Defaults
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        saveComputationConfig(compConfig)
                                        setCompNotice("Saved customized computation rates!")
                                        setTimeout(() => setCompNotice(null), 4000)
                                    }}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs shadow-lg"
                                >
                                    <Save className="h-3.5 w-3.5 mr-1.5" /> Save Overrides
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* 📅 CUSTOM HOLIDAY MANAGER */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-md">
                <div
                    onClick={() => setShowHolidaySection(!showHolidaySection)}
                    className="flex items-center justify-between cursor-pointer select-none"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <CalendarIcon className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-tight">Holiday Manager (Custom Holidays)</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Add company holidays, local city holidays, or future year holidays</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-xl">
                        {showHolidaySection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {showHolidaySection && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-3 border-t border-border/20 overflow-hidden"
                        >
                            {/* Filter Country Tabs */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setHolidayCountryFilter("TW")}
                                        className={cn(
                                            "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                                            holidayCountryFilter === "TW" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        🇹🇼 Taiwan
                                    </button>
                                    <button
                                        onClick={() => setHolidayCountryFilter("PH")}
                                        className={cn(
                                            "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                                            holidayCountryFilter === "PH" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        🇵🇭 Philippines
                                    </button>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                    {customHolidays.filter(h => h.country === holidayCountryFilter).length} custom holidays added
                                </span>
                            </div>

                            {/* Add Custom Holiday Form */}
                            <form
                                onSubmit={e => {
                                    e.preventDefault()
                                    if (!newHoliday.date || !newHoliday.name) return
                                    const updated = addCustomHoliday({
                                        date: newHoliday.date,
                                        name: newHoliday.name,
                                        country: newHoliday.country,
                                        type: newHoliday.type
                                    })
                                    setCustomHolidays(updated)
                                    setNewHoliday({ date: "", name: "", country: holidayCountryFilter, type: "regular_holiday" })
                                }}
                                className="bg-muted/40 p-3 rounded-xl border border-border/20 space-y-2.5"
                            >
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">➕ Add New Holiday</span>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                    <input
                                        type="date"
                                        value={newHoliday.date}
                                        onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value, country: holidayCountryFilter })}
                                        className="px-2.5 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Holiday Name (e.g. Company Anniversary)"
                                        value={newHoliday.name}
                                        onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value, country: holidayCountryFilter })}
                                        className="sm:col-span-2 px-2.5 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-medium"
                                        required
                                    />
                                    <select
                                        value={newHoliday.type}
                                        onChange={e => setNewHoliday({ ...newHoliday, type: e.target.value as any })}
                                        className="px-2.5 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold"
                                    >
                                        <option value="regular_holiday">Regular Holiday</option>
                                        <option value="special_holiday">Special Holiday</option>
                                    </select>
                                </div>
                                <Button type="submit" size="sm" className="w-full bg-primary text-primary-foreground font-bold rounded-xl text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Save Custom Holiday
                                </Button>
                            </form>

                            {/* Holiday List */}
                            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                                {getAllHolidays()
                                    .filter(h => h.country === holidayCountryFilter)
                                    .map((h, i) => (
                                        <div
                                            key={`${h.date}-${h.country}-${i}`}
                                            className="flex items-center justify-between p-2 rounded-xl bg-background border border-border/20 text-xs"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="font-bold text-sky-500 tabular-nums shrink-0">{h.date}</span>
                                                <span className="font-semibold truncate">{h.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                    h.type === "regular_holiday" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                                                )}>
                                                    {h.type === "regular_holiday" ? "Regular" : "Special"}
                                                </span>
                                                {h.isCustom ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = deleteCustomHoliday(h.date, h.country)
                                                            setCustomHolidays(updated)
                                                        }}
                                                        className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                        title="Delete custom holiday"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Official</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* 💸 RECURRING PAYROLL DEDUCTIONS (Kinsenas / Monthly) */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-md">
                <div
                    onClick={() => setShowDeductionSection(!showDeductionSection)}
                    className="flex items-center justify-between cursor-pointer select-none"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-tight">Recurring Payroll Deductions</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">Manage cash advances, loans, dormitory, SSS/PhilHealth/PagIBIG monthly or kinsenas deductions</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8 rounded-xl">
                        {showDeductionSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {showDeductionSection && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-3 border-t border-border/20 overflow-hidden"
                        >
                            {/* Profile Selector */}
                            {profiles.length > 0 && (
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                        Select Work Profile
                                    </label>
                                    <select
                                        value={selectedDeductionProfileId}
                                        onChange={e => setSelectedDeductionProfileId(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold"
                                    >
                                        {profiles.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.label} ({p.country === "TW" ? "Taiwan 🇹🇼" : "Philippines 🇵🇭"})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Add Deduction Form */}
                            <form
                                onSubmit={e => {
                                    e.preventDefault()
                                    if (!newDeduction.label || !newDeduction.amount || !selectedDeductionProfileId) return
                                    onAddDeduction?.({
                                        profile_id: selectedDeductionProfileId,
                                        label: newDeduction.label,
                                        amount: parseFloat(newDeduction.amount) || 0,
                                        frequency: newDeduction.frequency,
                                        is_active: true
                                    })
                                    setNewDeduction({ label: "", amount: "", frequency: "kinsenas" })
                                }}
                                className="bg-muted/40 p-3 rounded-xl border border-border/20 space-y-2.5"
                            >
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">➕ Add New Recurring Deduction</span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g. SSS, Cash Advance)"
                                        value={newDeduction.label}
                                        onChange={e => setNewDeduction({ ...newDeduction, label: e.target.value })}
                                        className="px-2.5 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-medium"
                                        required
                                    />
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Amount per deduction"
                                        value={newDeduction.amount}
                                        onChange={e => setNewDeduction({ ...newDeduction, amount: e.target.value })}
                                        className="px-2.5 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums"
                                        required
                                    />
                                    <select
                                        value={newDeduction.frequency}
                                        onChange={e => setNewDeduction({ ...newDeduction, frequency: e.target.value as any })}
                                        className="px-2.5 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold"
                                    >
                                        <option value="kinsenas">Kinsenas (2x / month)</option>
                                        <option value="monthly">Monthly (1x / month)</option>
                                    </select>
                                </div>

                                {/* Presets */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Presets:</span>
                                    {[
                                        { label: "SSS", amount: 1350, freq: "monthly" },
                                        { label: "PhilHealth", amount: 500, freq: "monthly" },
                                        { label: "Pag-IBIG", amount: 200, freq: "monthly" },
                                        { label: "Cash Advance (Vale)", amount: 1000, freq: "kinsenas" },
                                        { label: "Dormitory Fee", amount: 2500, freq: "monthly" },
                                    ].map(preset => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => setNewDeduction({ label: preset.label, amount: String(preset.amount), frequency: preset.freq as any })}
                                            className="px-2 py-0.5 bg-background border border-border/40 hover:bg-muted rounded-md text-[10px] font-bold text-muted-foreground transition-all"
                                        >
                                            + {preset.label}
                                        </button>
                                    ))}
                                </div>

                                <Button type="submit" size="sm" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-md">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Payroll Deduction
                                </Button>
                            </form>

                            {/* Active Deductions List */}
                            <div className="space-y-1.5">
                                {deductions.filter(d => d.profile_id === selectedDeductionProfileId).length === 0 ? (
                                    <div className="text-center py-4 text-xs font-bold text-muted-foreground">
                                        No recurring deductions added for this profile.
                                    </div>
                                ) : (
                                    deductions
                                        .filter(d => d.profile_id === selectedDeductionProfileId)
                                        .map(ded => (
                                            <div
                                                key={ded.id}
                                                className={cn(
                                                    "flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all",
                                                    ded.is_active ? "bg-background border-border/30" : "bg-muted/20 border-border/10 opacity-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={ded.is_active}
                                                        onChange={() => onToggleDeduction?.(ded.id)}
                                                        className="rounded text-rose-500 focus:ring-rose-500/20"
                                                    />
                                                    <div>
                                                        <span className="font-bold block">{ded.label}</span>
                                                        <span className="text-[9px] font-bold uppercase text-muted-foreground">
                                                            {ded.frequency === "kinsenas" ? "Kinsenas (2x/mo)" : "Monthly (1x/mo)"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black tabular-nums text-rose-500">
                                                        -{ded.amount.toLocaleString()} / {ded.frequency === "kinsenas" ? "half" : "mo"}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteDeduction?.(ded.id)}
                                                        className="p-1 text-muted-foreground/40 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* 📦 FULL DATA BACKUP & RESTORE (Feature 10) */}
            {/* ═══════════════════════════════════════════ */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <Download className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">Full System Backup & Restore</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">Export all wallets, transactions, debts, bills, and logs to JSON or restore from a backup</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/20">
                    <Button
                        type="button"
                        onClick={() => {
                            const backupData = {
                                version: "1.0",
                                exportDate: new Date().toISOString(),
                                wallets,
                                entries,
                                debts,
                                payments,
                                bills,
                                wishlist,
                                funds,
                                budgets,
                                profiles,
                                timeLogs,
                                deductions,
                                customRates,
                                baseCurrency
                            }
                            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement("a")
                            link.href = url
                            link.download = `finance_full_backup_${new Date().toISOString().slice(0, 10)}.json`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            URL.revokeObjectURL(url)
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs gap-2 shadow-md"
                    >
                        <Download className="h-4 w-4" />
                        Export Full Backup (.json)
                    </Button>

                    <label className="w-full">
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = evt => {
                                    try {
                                        const data = JSON.parse(evt.target?.result as string)
                                        if (confirm("Restore full backup? This will sync all imported tables into your system.")) {
                                            if (data.wishlist) localStorage.setItem("wishlist_items", JSON.stringify(data.wishlist))
                                            if (data.funds) localStorage.setItem("savings_funds", JSON.stringify(data.funds))
                                            if (data.budgets) localStorage.setItem("category_budgets", JSON.stringify(data.budgets))
                                            if (data.profiles) localStorage.setItem("work_profiles", JSON.stringify(data.profiles))
                                            if (data.timeLogs) localStorage.setItem("time_logs", JSON.stringify(data.timeLogs))
                                            if (data.deductions) localStorage.setItem("finance_payroll_deductions", JSON.stringify(data.deductions))
                                            if (data.customRates) saveCustomExchangeRates(data.customRates)
                                            if (data.baseCurrency) savePrimaryBaseCurrency(data.baseCurrency)

                                            alert("✅ Backup restored successfully! Reloading page...")
                                            window.location.reload()
                                        }
                                    } catch (err) {
                                        alert("❌ Invalid JSON backup file.")
                                    }
                                }
                                reader.readAsText(file)
                            }}
                        />
                        <div className="w-full h-9 px-4 bg-card border border-border/50 hover:bg-muted rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm">
                            <RefreshCw className="h-4 w-4 text-primary" />
                            Restore from Backup (.json)
                        </div>
                    </label>
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
