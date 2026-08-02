import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    CreditCard,
    BarChart3,
    ArrowRightLeft,
    Receipt,
    History as HistoryIcon,
    Target,
    Settings,
    PiggyBank,
    Eye,
    EyeOff,
    Clock,
    Bell,
    Plus,
    Calendar,
    Globe,
    Sparkles,
    Camera
} from "lucide-react"
import { cn } from "../../lib/utils"
import { supabase } from "../../lib/supabase"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import { WalletCards } from "./WalletCards"
import { IncomeSection } from "./IncomeSection"
import { ExpenseSection } from "./ExpenseSection"
import { DebtSection } from "./DebtSection"
import { ReportsSection } from "./ReportsSection"
import { BillsSection } from "./BillsSection"
import { HistorySection } from "./HistorySection"
import { WishlistSection } from "./WishlistSection"
import { SettingsSection } from "./SettingsSection"
import { FundsSection } from "./FundsSection"
import { SalarySection } from "./SalarySection"
import { calculatePayroll } from "./salaryCalculator"
import type { Wallet, FinanceEntry, Debt, DebtPayment, BillTemplate, WishlistItem, SavingsFund, CategoryBudget, CurrencyCode, WorkProfile, TimeLog, PayrollDeduction } from "./types"
import { CURRENCIES, formatCurrency, getLocalDateString, getDefaultSmartWallet } from "./types"
import {
    getExchangeRates,
    getCustomExchangeRates,
    getPrimaryBaseCurrency,
    getDirectRate,
    DEFAULT_RATES_IN_USD,
    type ExchangeRates
} from "./currency"
import { getUpcomingHolidays } from "./holidays"

type Tab = "income" | "expenses" | "history" | "bills" | "debts" | "funds" | "wishlist" | "salary" | "reports" | "settings"

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
    { key: "income", label: "Income", icon: TrendingUp, color: "text-emerald-500" },
    { key: "expenses", label: "Expenses", icon: TrendingDown, color: "text-rose-500" },
    { key: "history", label: "History", icon: HistoryIcon, color: "text-stone-400" },
    { key: "salary", label: "Salary & OT", icon: Clock, color: "text-amber-400" },
    { key: "bills", label: "Bills", icon: Receipt, color: "text-amber-500" },
    { key: "debts", label: "Debts", icon: CreditCard, color: "text-orange-500" },
    { key: "funds", label: "Savings Goals", icon: PiggyBank, color: "text-emerald-400" },
    { key: "wishlist", label: "Wishlist", icon: Target, color: "text-sky-500" },
    { key: "reports", label: "Reports", icon: BarChart3, color: "text-primary" },
    { key: "settings", label: "Settings", icon: Settings, color: "text-stone-400" },
]

export default function FinanceTracker() {
    const [activeTab, setActiveTab] = useState<Tab>("income")
    const [isLoading, setIsLoading] = useState(true)
    const [showAmounts, setShowAmounts] = useState(() => {
        return localStorage.getItem("finance_show_amounts") !== "false"
    })
    
    // Exchange rates & base currency state
    const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => getPrimaryBaseCurrency())
    const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES_IN_USD)
    const [customRates, setCustomRates] = useState<Partial<ExchangeRates>>(() => getCustomExchangeRates())

    const [wallets, setWallets] = useState<Wallet[]>([])
    const [entries, setEntries] = useState<FinanceEntry[]>([])
    const [debts, setDebts] = useState<Debt[]>([])
    const [payments, setPayments] = useState<DebtPayment[]>([])
    const [bills, setBills] = useState<BillTemplate[]>([])
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [funds, setFunds] = useState<SavingsFund[]>([])
    const [budgets, setBudgets] = useState<CategoryBudget[]>([])
    const [workProfiles, setWorkProfiles] = useState<WorkProfile[]>([])
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
    const [payrollDeductions, setPayrollDeductions] = useState<PayrollDeduction[]>(() => {
        try {
            const stored = localStorage.getItem("finance_payroll_deductions")
            if (stored) return JSON.parse(stored)
        } catch (e) {
            console.warn("Error loading payroll deductions:", e)
        }
        return []
    })

    // Auto-resync live exchange rates on mount and every 15 minutes in background
    useEffect(() => {
        const syncRates = () => {
            getExchangeRates(true).then(fetchedRates => {
                setRates(fetchedRates)
            })
        }

        syncRates()
        const interval = setInterval(syncRates, 15 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])
    
    const [useLocalStorageWishlist, setUseLocalStorageWishlist] = useState(false)
    const [useLocalStorageFunds, setUseLocalStorageFunds] = useState(false)
    const [useLocalStorageBudgets, setUseLocalStorageBudgets] = useState(false)
    const [useLocalStorageProfiles, setUseLocalStorageProfiles] = useState(false)
    const [useLocalStorageLogs, setUseLocalStorageLogs] = useState(false)

    const togglePrivacyMode = () => {
        setShowAmounts(prev => {
            const next = !prev
            localStorage.setItem("finance_show_amounts", String(next))
            return next
        })
    }

    // Transfer modal
    const [showTransfer, setShowTransfer] = useState(false)
    const [transferData, setTransferData] = useState({
        from: "",
        to: "",
        amount: "",
        fee: "",
        notes: "",
        customRate: "",
    })

    useEffect(() => {
        if (showTransfer && !transferData.from && wallets.length > 0) {
            setTransferData(prev => ({
                ...prev,
                from: getDefaultSmartWallet(wallets)
            }))
        }
    }, [showTransfer, wallets, transferData.from])

    // Compute active profile's current month Net Salary Preset for Income Section
    const netSalaryPreset = useMemo(() => {
        if (workProfiles.length === 0) return null
        const activeProfile = workProfiles[0]
        const currentMonth = getLocalDateString().slice(0, 7)
        const monthlyLogs = timeLogs.filter(l => l.profile_id === activeProfile.id && l.date.startsWith(currentMonth))
        const summary = calculatePayroll(monthlyLogs, activeProfile, payrollDeductions, "full")
        if (!summary || summary.netPay <= 0) return null
        return {
            amount: summary.netPay,
            profileLabel: activeProfile.label,
            currency: activeProfile.currency,
            targetWalletId: activeProfile.wallet_id || undefined
        }
    }, [workProfiles, timeLogs, payrollDeductions])

    // Fetch all data
    const fetchAll = useCallback(async () => {
        try {
            const [walletsRes, entriesRes, debtsRes, paymentsRes, billsRes] = await Promise.all([
                supabase.from("wallets").select("*").order("created_at"),
                supabase.from("finance_entries").select("*").order("date", { ascending: false }),
                supabase.from("debts").select("*").order("created_at"),
                supabase.from("debt_payments").select("*").order("date", { ascending: false }),
                supabase.from("bill_templates").select("*").order("created_at"),
            ])

            if (walletsRes.data) setWallets(walletsRes.data)
            if (entriesRes.data) setEntries(entriesRes.data)
            if (debtsRes.data) setDebts(debtsRes.data)
            if (paymentsRes.data) setPayments(paymentsRes.data)
            if (billsRes.data) setBills(billsRes.data)

            // Wishlist fetch
            let wishlistData: WishlistItem[] | null = null
            let hasWishlistTable = false
            try {
                const { data, error } = await supabase.from("wishlist_items").select("*").order("created_at")
                if (error) throw error
                if (data) {
                    wishlistData = data
                    hasWishlistTable = true
                }
            } catch (err) {
                console.warn("Wishlist table not found or error, falling back to LocalStorage:", err)
            }

            if (hasWishlistTable && wishlistData) {
                setWishlist(wishlistData)
                setUseLocalStorageWishlist(false)
            } else {
                setUseLocalStorageWishlist(true)
                const localData = localStorage.getItem("wishlist_items")
                if (localData) {
                    setWishlist(JSON.parse(localData))
                }
            }

            // Savings Funds fetch
            let fundsData: SavingsFund[] | null = null
            let hasFundsTable = false
            try {
                const { data, error } = await supabase.from("savings_funds").select("*").order("created_at")
                if (error) throw error
                if (data) {
                    fundsData = data
                    hasFundsTable = true
                }
            } catch (err) {
                console.warn("Savings funds table not found or error, falling back to LocalStorage:", err)
            }

            if (hasFundsTable && fundsData) {
                setFunds(fundsData)
                setUseLocalStorageFunds(false)
            } else {
                setUseLocalStorageFunds(true)
                const localData = localStorage.getItem("savings_funds")
                if (localData) {
                    setFunds(JSON.parse(localData))
                }
            }

            // Category Budgets fetch
            let budgetsData: CategoryBudget[] | null = null
            let hasBudgetsTable = false
            try {
                const { data, error } = await supabase.from("category_budgets").select("*").order("created_at")
                if (error) throw error
                if (data) {
                    budgetsData = data
                    hasBudgetsTable = true
                }
            } catch (err) {
                console.warn("Category budgets table not found or error, falling back to LocalStorage:", err)
            }

            if (hasBudgetsTable && budgetsData) {
                setBudgets(budgetsData)
                setUseLocalStorageBudgets(false)
            } else {
                setUseLocalStorageBudgets(true)
                const localData = localStorage.getItem("category_budgets")
                if (localData) {
                    setBudgets(JSON.parse(localData))
                }
            }

            // Work Profiles fetch
            let profilesData: WorkProfile[] | null = null
            let hasProfilesTable = false
            try {
                const { data, error } = await supabase.from("work_profiles").select("*").order("created_at")
                if (error) throw error
                if (data) {
                    profilesData = data
                    hasProfilesTable = true
                }
            } catch (err) {
                console.warn("Work profiles table not found, falling back to LocalStorage:", err)
            }

            if (hasProfilesTable && profilesData) {
                setWorkProfiles(profilesData)
                setUseLocalStorageProfiles(false)
            } else {
                setUseLocalStorageProfiles(true)
                const localProfiles = localStorage.getItem("work_profiles")
                if (localProfiles) {
                    setWorkProfiles(JSON.parse(localProfiles))
                }
            }

            // Time Logs fetch
            let logsData: TimeLog[] | null = null
            let hasLogsTable = false
            try {
                const { data, error } = await supabase.from("time_logs").select("*").order("date", { ascending: false })
                if (error) throw error
                if (data) {
                    logsData = data
                    hasLogsTable = true
                }
            } catch (err) {
                console.warn("Time logs table not found, falling back to LocalStorage:", err)
            }

            if (hasLogsTable && logsData) {
                setTimeLogs(logsData)
                setUseLocalStorageLogs(false)
            } else {
                setUseLocalStorageLogs(true)
                const localLogs = localStorage.getItem("time_logs")
                if (localLogs) {
                    setTimeLogs(JSON.parse(localLogs))
                }
            }

            // Payroll Deductions fetch from Supabase
            try {
                const { data, error } = await supabase.from("payroll_deductions").select("*").order("created_at")
                if (!error && data && data.length > 0) {
                    setPayrollDeductions(data)
                }
            } catch (err) {
                console.warn("Payroll deductions fetch error, keeping local:", err)
            }
        } catch (e) {
            console.error("Error fetching finance data:", e)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    // Add finance entry (income or expense)
    const handleAddEntry = async (entry: Omit<FinanceEntry, "id" | "created_at">) => {
        try {
            let insertedData: FinanceEntry | null = null

            // Try inserting full entry
            const { data, error } = await supabase
                .from("finance_entries")
                .insert(entry)
                .select()
                .single()

            if (error) {
                // If column error or schema mismatch (e.g. 400 for unknown currency column), retry with core fields
                const { currency, exchange_rate, ...coreEntry } = entry as any
                const { data: retryData, error: retryError } = await supabase
                    .from("finance_entries")
                    .insert(coreEntry)
                    .select()
                    .single()

                if (retryError) {
                    console.warn("Supabase entry insert warning, using local state fallback:", retryError)
                } else {
                    insertedData = retryData
                }
            } else {
                insertedData = data
            }

            const finalEntry: FinanceEntry = insertedData || {
                ...entry,
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
                created_at: new Date().toISOString()
            }

            // Update wallet balance atomically using functional updater
            // This ensures sequential calls (e.g. transfer + fee) always use the latest balance
            let computedNewBalance: number | undefined
            setWallets(prev => {
                const wallet = prev.find(w => w.id === entry.wallet_id)
                if (!wallet) return prev
                computedNewBalance = entry.type === "income"
                    ? wallet.balance + entry.amount
                    : wallet.balance - entry.amount
                return prev.map(w =>
                    w.id === entry.wallet_id ? { ...w, balance: computedNewBalance! } : w
                )
            })

            // Sync computed balance to Supabase
            if (computedNewBalance !== undefined) {
                try {
                    await supabase
                        .from("wallets")
                        .update({ balance: computedNewBalance })
                        .eq("id", entry.wallet_id)
                } catch (err) {
                    console.warn("Updating wallet balance in Supabase failed, updated locally:", err)
                }
            }

            setEntries(prev => [finalEntry, ...prev])
        } catch (e) {
            console.error("Error adding entry:", e)
        }
    }

    // Delete finance entry
    const handleDeleteEntry = async (id: string) => {
        const entry = entries.find(e => e.id === id)
        if (!entry) return

        try {
            const { error } = await supabase
                .from("finance_entries")
                .delete()
                .eq("id", id)

            if (error) throw error

            // Reverse wallet balance atomically using functional updater
            let computedNewBalance: number | undefined
            setWallets(prev => {
                const wallet = prev.find(w => w.id === entry.wallet_id)
                if (!wallet) return prev
                computedNewBalance = entry.type === "income"
                    ? wallet.balance - entry.amount
                    : wallet.balance + entry.amount
                return prev.map(w =>
                    w.id === entry.wallet_id ? { ...w, balance: computedNewBalance! } : w
                )
            })

            if (computedNewBalance !== undefined) {
                try {
                    await supabase
                        .from("wallets")
                        .update({ balance: computedNewBalance })
                        .eq("id", entry.wallet_id)
                } catch (err) {
                    console.warn("Reversing wallet balance in Supabase failed, updated locally:", err)
                }
            }

            // Also check if this deletion affects any savings goal balance
            if (entry.category === "savings_deposit" || entry.category === "savings_withdraw") {
                const desc = entry.description
                const isDeposit = entry.category === "savings_deposit"
                const matchedFund = funds.find(f => desc.includes(f.label))
                if (matchedFund) {
                    const newCurrentAmount = isDeposit
                        ? matchedFund.current_amount - entry.amount
                        : matchedFund.current_amount + entry.amount

                    if (useLocalStorageFunds) {
                        const updated = funds.map(f =>
                            f.id === matchedFund.id ? { ...f, current_amount: newCurrentAmount } : f
                        )
                        setFunds(updated)
                        localStorage.setItem("savings_funds", JSON.stringify(updated))
                    } else {
                        await supabase
                            .from("savings_funds")
                            .update({ current_amount: newCurrentAmount })
                            .eq("id", matchedFund.id)
                        setFunds(prev => prev.map(f =>
                            f.id === matchedFund.id ? { ...f, current_amount: newCurrentAmount } : f
                        ))
                    }
                }
            }

            setEntries(prev => prev.filter(e => e.id !== id))
        } catch (e) {
            console.error("Error deleting entry:", e)
        }
    }

    // Add debt
    const handleAddDebt = async (debt: Omit<Debt, "id" | "created_at" | "paid_amount" | "is_settled">) => {
        try {
            const { data, error } = await supabase
                .from("debts")
                .insert({ 
                    label: debt.label,
                    total_amount: debt.total_amount,
                    paid_amount: 0, 
                    is_settled: false,
                    interest_rate: debt.interest_rate,
                    due_date: debt.due_date,
                    min_monthly_payment: debt.min_monthly_payment
                })
                .select()
                .single()

            if (error) {
                // Fallback without optional columns if error occurs
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from("debts")
                    .insert({ label: debt.label, total_amount: debt.total_amount, paid_amount: 0, is_settled: false })
                    .select()
                    .single()
                if (!fallbackError && fallbackData) setDebts(prev => [...prev, { ...fallbackData, ...debt }])
                else throw error
            } else if (data) {
                setDebts(prev => [...prev, data])
            }
        } catch (e) {
            console.error("Error adding debt:", e)
        }
    }

    // Add debt payment
    const handleAddPayment = async (payment: Omit<DebtPayment, "id" | "created_at">) => {
        try {
            const { data, error } = await supabase
                .from("debt_payments")
                .insert({
                    debt_id: payment.debt_id,
                    amount: payment.amount,
                    date: payment.date,
                    notes: payment.notes
                })
                .select()
                .single()

            if (error) throw error

            const debt = debts.find(d => d.id === payment.debt_id)

            if (debt) {
                const newPaid = debt.paid_amount + payment.amount
                const isSettled = newPaid >= debt.total_amount

                await supabase
                    .from("debts")
                    .update({ paid_amount: newPaid, is_settled: isSettled })
                    .eq("id", payment.debt_id)

                setDebts(prev => prev.map(d =>
                    d.id === payment.debt_id
                        ? { ...d, paid_amount: newPaid, is_settled: isSettled }
                        : d
                ))

                if (payment.wallet_id) {
                    await handleAddEntry({
                        type: "expense",
                        date: payment.date,
                        category: "debt_payment",
                        description: `Paid Debt: ${debt.label}${payment.notes ? ` (${payment.notes})` : ""}`,
                        amount: payment.amount,
                        wallet_id: payment.wallet_id
                    })
                }
            }

            if (data) {
                setPayments(prev => [{ ...data, wallet_id: payment.wallet_id }, ...prev])
            }
        } catch (e) {
            console.error("Error adding payment:", e)
        }
    }

    // Delete debt
    const handleDeleteDebt = async (id: string) => {
        try {
            const { error } = await supabase
                .from("debts")
                .delete()
                .eq("id", id)

            if (error) throw error
            setDebts(prev => prev.filter(d => d.id !== id))
            setPayments(prev => prev.filter(p => p.debt_id !== id))
        } catch (e) {
            console.error("Error deleting debt:", e)
        }
    }

    // Add bill template
    const handleAddBill = async (bill: Omit<BillTemplate, "id" | "created_at">) => {
        try {
            const { data, error } = await supabase
                .from("bill_templates")
                .insert(bill)
                .select()
                .single()

            if (error) throw error
            if (data) setBills(prev => [...prev, data])
        } catch (e) {
            console.error("Error adding bill template:", e)
        }
    }

    // Delete bill template
    const handleDeleteBill = async (id: string) => {
        try {
            const { error } = await supabase
                .from("bill_templates")
                .delete()
                .eq("id", id)

            if (error) throw error
            setBills(prev => prev.filter(b => b.id !== id))
        } catch (e) {
            console.error("Error deleting bill template:", e)
        }
    }

    // Update bill template
    const handleUpdateBill = async (bill: BillTemplate) => {
        try {
            const { data, error } = await supabase
                .from("bill_templates")
                .update({
                    label: bill.label,
                    category: bill.category,
                    amount: bill.amount,
                    due_day: bill.due_day,
                    penalty_amount: bill.penalty_amount,
                })
                .eq("id", bill.id)
                .select()
                .single()

            if (error) throw error
            if (data) setBills(prev => prev.map(b => b.id === bill.id ? data : b))
        } catch (e) {
            console.error("Error updating bill template:", e)
        }
    }

    // Pay bill template (bill.amount is overridden by BillsSection with the user-entered payAmount including penalty)
    const handlePayBill = async (bill: BillTemplate, walletId: string) => {
        const hasPenalty = bill.penalty_amount && bill.amount > (bills.find(b => b.id === bill.id)?.amount || 0)
        const description = hasPenalty
            ? `Paid Bill: ${bill.label} (includes late penalty)`
            : `Paid Bill: ${bill.label}`

        await handleAddEntry({
            type: "expense",
            date: getLocalDateString(),
            category: bill.category,
            description,
            amount: bill.amount,
            wallet_id: walletId,
        })
    }

    // Transfer between wallets (supports multi-currency conversion)
    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        const { from, to, amount: amtStr, fee: feeStr, notes } = transferData
        const fromAmount = parseFloat(amtStr)
        const feeAmount = parseFloat(feeStr || "0")
        if (!from || !to || from === to || !fromAmount || fromAmount <= 0) return

        try {
            const fromWallet = wallets.find(w => w.id === from)
            const toWallet = wallets.find(w => w.id === to)
            if (!fromWallet || !toWallet) return

            const fromCurr = fromWallet.currency || "PHP"
            const toCurr = toWallet.currency || "PHP"
            
            // Calculate converted amount for destination wallet using live or custom user FX rate
            const defaultRate = getDirectRate(fromCurr, toCurr, rates, customRates)
            const customRateVal = transferData.customRate ? parseFloat(transferData.customRate) : 0
            const effectiveRate = customRateVal > 0 ? customRateVal : defaultRate

            const targetAmount = fromCurr === toCurr 
                ? fromAmount 
                : fromAmount * effectiveRate

            const notesSuffix = notes ? ` (${notes})` : ""

            // Deduct from source wallet (expense)
            await handleAddEntry({
                type: "expense",
                date: getLocalDateString(),
                category: "transfer",
                description: fromCurr !== toCurr 
                    ? `Transfer to ${toWallet.name} (${formatCurrency(targetAmount, toCurr)})${notesSuffix}`
                    : `Transfer to ${toWallet.name}${notesSuffix}`,
                amount: fromAmount,
                wallet_id: from,
                currency: fromCurr,
            })

            // Deduct transfer fee if applicable
            if (feeAmount > 0) {
                await handleAddEntry({
                    type: "expense",
                    date: getLocalDateString(),
                    category: "transfer",
                    description: `Transfer Fee (${toWallet.name})`,
                    amount: feeAmount,
                    wallet_id: from,
                    currency: fromCurr,
                })
            }

            // Deposit to destination wallet (income)
            await handleAddEntry({
                type: "income",
                date: getLocalDateString(),
                category: "transfer",
                description: fromCurr !== toCurr 
                    ? `Transfer from ${fromWallet.name} (${formatCurrency(fromAmount, fromCurr)})${notesSuffix}`
                    : `Transfer from ${fromWallet.name}${notesSuffix}`,
                amount: targetAmount,
                wallet_id: to,
                currency: toCurr,
            })

            setTransferData({ from: "", to: "", amount: "", fee: "", notes: "", customRate: "" })
            setShowTransfer(false)
        } catch (e) {
            console.error("Error transferring:", e)
        }
    }

    // Add wishlist item
    const handleAddWishlistItem = async (item: Omit<WishlistItem, "id" | "created_at" | "is_purchased" | "actual_price" | "purchased_date" | "wallet_id">) => {
        const tempId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
        const newItem: WishlistItem = {
            ...item,
            id: tempId,
            is_purchased: false,
            actual_price: null,
            purchased_date: null,
            wallet_id: null,
            created_at: new Date().toISOString()
        }

        if (useLocalStorageWishlist) {
            const updated = [...wishlist, newItem]
            setWishlist(updated)
            localStorage.setItem("wishlist_items", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("wishlist_items")
                    .insert({
                        label: item.label,
                        estimated_price: item.estimated_price,
                        priority: item.priority,
                        notes: item.notes,
                        target_date: item.target_date,
                        url: item.url,
                        is_purchased: false
                    })
                    .select()
                    .single()

                if (error) throw error
                if (data) setWishlist(prev => [...prev, data])
            } catch (e) {
                console.warn("Adding to wishlist table failed, switching to LocalStorage:", e)
                setUseLocalStorageWishlist(true)
                const updated = [...wishlist, newItem]
                setWishlist(updated)
                localStorage.setItem("wishlist_items", JSON.stringify(updated))
            }
        }
    }

    // Purchase wishlist item
    const handlePurchaseWishlistItem = async (id: string, actualPrice: number, walletId: string, notes: string | null, date: string) => {
        const item = wishlist.find(i => i.id === id)
        if (!item) return

        await handleAddEntry({
            type: "expense",
            date: date,
            category: "wishlist",
            description: notes || `Bought Wishlist: ${item.label}`,
            amount: actualPrice,
            wallet_id: walletId
        })

        if (useLocalStorageWishlist) {
            const updated = wishlist.map(i =>
                i.id === id
                    ? {
                          ...i,
                          is_purchased: true,
                          actual_price: actualPrice,
                          purchased_date: date,
                          wallet_id: walletId
                      }
                    : i
            )
            setWishlist(updated)
            localStorage.setItem("wishlist_items", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("wishlist_items")
                    .update({
                        is_purchased: true,
                        actual_price: actualPrice,
                        purchased_date: date,
                        wallet_id: walletId
                    })
                    .eq("id", id)
                    .select()
                    .single()

                if (error) throw error
                if (data) setWishlist(prev => prev.map(i => (i.id === id ? data : i)))
            } catch (e) {
                console.error("Error updating wishlist in database:", e)
                setWishlist(prev =>
                    prev.map(i =>
                        i.id === id
                            ? {
                                  ...i,
                                  is_purchased: true,
                                  actual_price: actualPrice,
                                  purchased_date: date,
                                  wallet_id: walletId
                              }
                            : i
                    )
                )
            }
        }
    }

    // Delete wishlist item
    const handleDeleteWishlistItem = async (id: string) => {
        if (useLocalStorageWishlist) {
            const updated = wishlist.filter(i => i.id !== id)
            setWishlist(updated)
            localStorage.setItem("wishlist_items", JSON.stringify(updated))
        } else {
            try {
                const { error } = await supabase
                    .from("wishlist_items")
                    .delete()
                    .eq("id", id)

                if (error) throw error
                setWishlist(prev => prev.filter(i => i.id !== id))
            } catch (e) {
                console.error("Error deleting from wishlist database:", e)
                setWishlist(prev => prev.filter(i => i.id !== id))
            }
        }
    }

    // Add Wallet
    const handleAddWallet = async (wallet: Omit<Wallet, "id" | "created_at">) => {
        try {
            const { data, error } = await supabase
                .from("wallets")
                .insert(wallet)
                .select()
                .single()

            if (error) throw error
            if (data) setWallets(prev => [...prev, data])
        } catch (e) {
            console.error("Error adding wallet:", e)
        }
    }

    // Update Wallet
    const handleUpdateWallet = async (wallet: Wallet) => {
        try {
            const { data, error } = await supabase
                .from("wallets")
                .update({
                    name: wallet.name,
                    icon: wallet.icon,
                    currency: wallet.currency,
                    balance: wallet.balance
                })
                .eq("id", wallet.id)
                .select()
                .single()

            if (error) throw error
            if (data) setWallets(prev => prev.map(w => (w.id === wallet.id ? data : w)))
        } catch (e) {
            console.error("Error updating wallet:", e)
        }
    }

    // Delete Wallet
    const handleDeleteWallet = async (id: string) => {
        try {
            const { error } = await supabase
                .from("wallets")
                .delete()
                .eq("id", id)

            if (error) throw error
            setWallets(prev => prev.filter(w => w.id !== id))
        } catch (e) {
            console.error("Error deleting wallet:", e)
        }
    }

    // Add Savings Fund
    const handleAddFund = async (fund: Omit<SavingsFund, "id" | "created_at">) => {
        const tempId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
        const newFund: SavingsFund = {
            ...fund,
            id: tempId,
            created_at: new Date().toISOString()
        }

        if (useLocalStorageFunds) {
            const updated = [...funds, newFund]
            setFunds(updated)
            localStorage.setItem("savings_funds", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("savings_funds")
                    .insert(fund)
                    .select()
                    .single()

                if (error) throw error
                if (data) setFunds(prev => [...prev, data])
            } catch (e) {
                console.warn("Adding savings fund to database failed, switching to LocalStorage:", e)
                setUseLocalStorageFunds(true)
                const updated = [...funds, newFund]
                setFunds(updated)
                localStorage.setItem("savings_funds", JSON.stringify(updated))
            }
        }
    }

    // Fund Transaction (Deposit / Withdraw)
    const handleFundTransaction = async (id: string, amount: number, type: "deposit" | "withdraw", walletId: string, notes: string | null) => {
        const fund = funds.find(f => f.id === id)
        if (!fund) return

        const newCurrentAmount = type === "deposit"
            ? fund.current_amount + amount
            : fund.current_amount - amount

        await handleAddEntry({
            type: type === "deposit" ? "expense" : "income",
            date: getLocalDateString(),
            category: type === "deposit" ? "savings_deposit" : "savings_withdraw",
            description: notes || `${type === "deposit" ? "Deposit to" : "Withdrawal from"} ${fund.label}`,
            amount: amount,
            wallet_id: walletId
        })

        if (useLocalStorageFunds) {
            const updated = funds.map(f =>
                f.id === id ? { ...f, current_amount: newCurrentAmount } : f
            )
            setFunds(updated)
            localStorage.setItem("savings_funds", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("savings_funds")
                    .update({ current_amount: newCurrentAmount })
                    .eq("id", id)
                    .select()
                    .single()

                if (error) throw error
                if (data) setFunds(prev => prev.map(f => (f.id === id ? data : f)))
            } catch (e) {
                console.error("Error updating savings fund:", e)
                setFunds(prev => prev.map(f =>
                    f.id === id ? { ...f, current_amount: newCurrentAmount } : f
                ))
            }
        }
    }

    // Delete Savings Fund
    const handleDeleteFund = async (id: string) => {
        if (useLocalStorageFunds) {
            const updated = funds.filter(f => f.id !== id)
            setFunds(updated)
            localStorage.setItem("savings_funds", JSON.stringify(updated))
        } else {
            try {
                const { error } = await supabase
                    .from("savings_funds")
                    .delete()
                    .eq("id", id)

                if (error) throw error
                setFunds(prev => prev.filter(f => f.id !== id))
            } catch (e) {
                console.error("Error deleting savings fund:", e)
                setFunds(prev => prev.filter(f => f.id !== id))
            }
        }
    }

    // Payroll Deductions CRUD (Supabase + LocalStorage sync)
    const handleAddDeduction = async (deduction: Omit<PayrollDeduction, "id" | "created_at">) => {
        const newDed: PayrollDeduction = {
            ...deduction,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        }
        try {
            const { data, error } = await supabase.from("payroll_deductions").insert(deduction).select().single()
            if (!error && data) {
                setPayrollDeductions(prev => [...prev, data])
                return
            }
        } catch (e) {
            console.warn("Supabase deduction insert failed, using local storage:", e)
        }
        const updated = [...payrollDeductions, newDed]
        setPayrollDeductions(updated)
        localStorage.setItem("finance_payroll_deductions", JSON.stringify(updated))
    }

    const handleDeleteDeduction = async (id: string) => {
        try {
            await supabase.from("payroll_deductions").delete().eq("id", id)
        } catch (e) {
            console.warn("Supabase deduction delete error:", e)
        }
        const updated = payrollDeductions.filter(d => d.id !== id)
        setPayrollDeductions(updated)
        localStorage.setItem("finance_payroll_deductions", JSON.stringify(updated))
    }

    const handleToggleDeduction = async (id: string) => {
        const ded = payrollDeductions.find(d => d.id === id)
        if (!ded) return
        const nextActive = !ded.is_active
        try {
            await supabase.from("payroll_deductions").update({ is_active: nextActive }).eq("id", id)
        } catch (e) {
            console.warn("Supabase deduction toggle error:", e)
        }
        const updated = payrollDeductions.map(d => d.id === id ? { ...d, is_active: nextActive } : d)
        setPayrollDeductions(updated)
        localStorage.setItem("finance_payroll_deductions", JSON.stringify(updated))
    }

    // Work Profile CRUD
    const handleAddProfile = async (profile: Omit<WorkProfile, "id" | "created_at">) => {
        const newProfile: WorkProfile = {
            ...profile,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        }

        if (useLocalStorageProfiles) {
            const updated = [...workProfiles, newProfile]
            setWorkProfiles(updated)
            localStorage.setItem("work_profiles", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("work_profiles")
                    .insert(profile)
                    .select()
                    .single()
                if (error) throw error
                if (data) setWorkProfiles(prev => [...prev, data])
            } catch (err) {
                console.warn("Supabase profile insert failed, storing locally:", err)
                const updated = [...workProfiles, newProfile]
                setWorkProfiles(updated)
                localStorage.setItem("work_profiles", JSON.stringify(updated))
                setUseLocalStorageProfiles(true)
            }
        }
    }

    const handleUpdateProfile = async (id: string, updates: Partial<WorkProfile>) => {
        if (useLocalStorageProfiles) {
            const updated = workProfiles.map(p => p.id === id ? { ...p, ...updates } : p)
            setWorkProfiles(updated)
            localStorage.setItem("work_profiles", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("work_profiles")
                    .update(updates)
                    .eq("id", id)
                    .select()
                    .single()
                if (error) throw error
                if (data) setWorkProfiles(prev => prev.map(p => p.id === id ? data : p))
            } catch (err) {
                console.error("Error updating profile:", err)
                const updated = workProfiles.map(p => p.id === id ? { ...p, ...updates } : p)
                setWorkProfiles(updated)
                localStorage.setItem("work_profiles", JSON.stringify(updated))
            }
        }
    }

    const handleDeleteProfile = async (id: string) => {
        if (useLocalStorageProfiles) {
            const updated = workProfiles.filter(p => p.id !== id)
            setWorkProfiles(updated)
            localStorage.setItem("work_profiles", JSON.stringify(updated))
        } else {
            try {
                const { error } = await supabase.from("work_profiles").delete().eq("id", id)
                if (error) throw error
                setWorkProfiles(prev => prev.filter(p => p.id !== id))
            } catch (err) {
                console.error("Error deleting profile:", err)
                const updated = workProfiles.filter(p => p.id !== id)
                setWorkProfiles(updated)
                localStorage.setItem("work_profiles", JSON.stringify(updated))
            }
        }
    }

    // TimeLog CRUD
    const handleAddTimeLog = async (log: Omit<TimeLog, "id" | "created_at">) => {
        const newLog: TimeLog = {
            ...log,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        }

        if (useLocalStorageLogs) {
            const updated = [newLog, ...timeLogs]
            setTimeLogs(updated)
            localStorage.setItem("time_logs", JSON.stringify(updated))
        } else {
            try {
                const { data, error } = await supabase
                    .from("time_logs")
                    .insert(log)
                    .select()
                    .single()
                if (error) throw error
                if (data) setTimeLogs(prev => [data, ...prev])
            } catch (err) {
                console.warn("Supabase timelog insert failed, storing locally:", err)
                const updated = [newLog, ...timeLogs]
                setTimeLogs(updated)
                localStorage.setItem("time_logs", JSON.stringify(updated))
                setUseLocalStorageLogs(true)
            }
        }
    }

    const handleDeleteTimeLog = async (id: string) => {
        if (useLocalStorageLogs) {
            const updated = timeLogs.filter(l => l.id !== id)
            setTimeLogs(updated)
            localStorage.setItem("time_logs", JSON.stringify(updated))
        } else {
            try {
                const { error } = await supabase.from("time_logs").delete().eq("id", id)
                if (error) throw error
                setTimeLogs(prev => prev.filter(l => l.id !== id))
            } catch (err) {
                console.error("Error deleting time log:", err)
                const updated = timeLogs.filter(l => l.id !== id)
                setTimeLogs(updated)
                localStorage.setItem("time_logs", JSON.stringify(updated))
            }
        }
    }

    // Add Category Budget Limit
    const handleAddBudget = async (budget: Omit<CategoryBudget, "id" | "created_at">) => {
        const tempId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
        const newBudget: CategoryBudget = {
            ...budget,
            id: tempId,
            created_at: new Date().toISOString()
        }

        if (useLocalStorageBudgets) {
            // Overwrite existing category budget if it exists, otherwise append
            const existingIdx = budgets.findIndex(b => b.category === budget.category)
            let updated: CategoryBudget[] = []
            if (existingIdx !== -1) {
                updated = budgets.map((b, i) => (i === existingIdx ? { ...b, limit_amount: budget.limit_amount } : b))
            } else {
                updated = [...budgets, newBudget]
            }
            setBudgets(updated)
            localStorage.setItem("category_budgets", JSON.stringify(updated))
        } else {
            try {
                const existing = budgets.find(b => b.category === budget.category)
                if (existing) {
                    const { data, error } = await supabase
                        .from("category_budgets")
                        .update({ limit_amount: budget.limit_amount })
                        .eq("id", existing.id)
                        .select()
                        .single()

                    if (error) throw error
                    if (data) setBudgets(prev => prev.map(b => (b.id === existing.id ? data : b)))
                } else {
                    const { data, error } = await supabase
                        .from("category_budgets")
                        .insert(budget)
                        .select()
                        .single()

                    if (error) throw error
                    if (data) setBudgets(prev => [...prev, data])
                }
            } catch (e) {
                console.warn("Adding category budget to database failed, switching to LocalStorage:", e)
                setUseLocalStorageBudgets(true)
                const updated = [...budgets, newBudget]
                setBudgets(updated)
                localStorage.setItem("category_budgets", JSON.stringify(updated))
            }
        }
    }

    // Delete Category Budget Limit
    const handleDeleteBudget = async (id: string) => {
        if (useLocalStorageBudgets) {
            const updated = budgets.filter(b => b.id !== id)
            setBudgets(updated)
            localStorage.setItem("category_budgets", JSON.stringify(updated))
        } else {
            try {
                const { error } = await supabase
                    .from("category_budgets")
                    .delete()
                    .eq("id", id)

                if (error) throw error
                setBudgets(prev => prev.filter(b => b.id !== id))
            } catch (e) {
                console.error("Error deleting category budget from database:", e)
                setBudgets(prev => prev.filter(b => b.id !== id))
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-32">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">
                        Loading Finance Data...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-3 sm:px-4 md:px-8 overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-start justify-between gap-4"
                >
                    <div className="space-y-1 sm:space-y-2 min-w-0">
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase">
                            Finance <span className="text-primary">Tracker</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-xl text-xs sm:text-sm hidden sm:block">
                            Track your salary, expenses, and debts in one place.
                        </p>
                    </div>

                    <button
                        onClick={togglePrivacyMode}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-sm shrink-0",
                            showAmounts 
                                ? "bg-card hover:bg-muted text-muted-foreground border-border/60"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        )}
                        title={showAmounts ? "Hide amounts (Privacy Mode)" : "Show amounts"}
                    >
                        {showAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="hidden sm:inline">{showAmounts ? "Hide Amounts" : "Privacy Mode"}</span>
                    </button>
                </motion.div>

                {/* 🌟 Top Statutory Holiday Alert Banner */}
                {(() => {
                    const activeProfile = workProfiles[0] || null
                    const country = activeProfile ? activeProfile.country : "TW"
                    const upcoming = getUpcomingHolidays(country, 2)
                    if (upcoming.length === 0) return null
                    const nextH = upcoming[0]

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <button
                                onClick={() => setActiveTab("salary")}
                                className="w-full p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 flex items-center gap-3 text-left transition-all hover:shadow-md group"
                            >
                                <div className="p-2 rounded-xl shrink-0 bg-purple-500/20 text-purple-400">
                                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black uppercase tracking-tight text-purple-400">
                                        🎉 NEXT STATUTORY HOLIDAY ({nextH.daysAway === 0 ? "TODAY!" : `IN ${nextH.daysAway} DAY${nextH.daysAway > 1 ? "S" : ""}`})
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                            {country === "TW" ? "🇹🇼" : "🇵🇭"} {nextH.name} ({new Date(nextH.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                            🔥 {nextH.type === "regular_holiday" ? "2.0x Double Pay" : "1.30x Special Pay"}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-bold shrink-0 group-hover:translate-x-0.5 transition-transform text-purple-400">
                                    View Salary & Holidays →
                                </span>
                            </button>
                        </motion.div>
                    )
                })()}

                {/* Bill Due Date Reminder Banner */}
                {(() => {
                    const today = new Date()
                    const currentDay = today.getDate()
                    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
                    
                    const billAlerts = bills.map(bill => {
                        if (!bill.due_day) return null
                        const dueDay = bill.due_day
                        let daysUntilDue: number
                        
                        if (dueDay >= currentDay) {
                            daysUntilDue = dueDay - currentDay
                        } else {
                            daysUntilDue = (daysInMonth - currentDay) + dueDay
                        }
                        
                        // Check if already paid this month
                        const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
                        const isPaidThisMonth = entries.some(e => 
                            e.type === "expense" && 
                            e.date.startsWith(currentMonthKey) && 
                            e.description.includes(bill.label) &&
                            (e.category === bill.category || e.category === "bills")
                        )
                        
                        if (isPaidThisMonth) return null
                        
                        const isOverdue = dueDay < currentDay && daysUntilDue > 15
                        const isDueSoon = daysUntilDue <= 5
                        const isDueToday = daysUntilDue === 0
                        
                        if (!isOverdue && !isDueSoon && !isDueToday) return null
                        
                        return { bill, daysUntilDue, isOverdue, isDueToday, isDueSoon }
                    }).filter(Boolean) as { bill: BillTemplate; daysUntilDue: number; isOverdue: boolean; isDueToday: boolean; isDueSoon: boolean }[]
                    
                    if (billAlerts.length === 0) return null
                    
                    const overdueCount = billAlerts.filter(a => a.isOverdue).length
                    const dueTodayCount = billAlerts.filter(a => a.isDueToday).length
                    const dueSoonCount = billAlerts.filter(a => a.isDueSoon && !a.isDueToday).length
                    
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <button
                                onClick={() => setActiveTab("bills")}
                                className={cn(
                                    "w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all hover:shadow-md group",
                                    overdueCount > 0
                                        ? "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15"
                                        : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl shrink-0",
                                    overdueCount > 0 ? "bg-rose-500/20" : "bg-amber-500/20"
                                )}>
                                    <Bell className={cn(
                                        "h-5 w-5",
                                        overdueCount > 0 ? "text-rose-500 animate-pulse" : "text-amber-500"
                                    )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-black uppercase tracking-tight",
                                        overdueCount > 0 ? "text-rose-500" : "text-amber-500"
                                    )}>
                                        {overdueCount > 0 && `⚠️ ${overdueCount} overdue bill${overdueCount > 1 ? "s" : ""}! `}
                                        {dueTodayCount > 0 && `📅 ${dueTodayCount} due today! `}
                                        {dueSoonCount > 0 && `🔔 ${dueSoonCount} due within 5 days`}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {billAlerts.slice(0, 4).map(alert => (
                                            <span
                                                key={alert.bill.id}
                                                className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-bold",
                                                    alert.isOverdue
                                                        ? "bg-rose-500/20 text-rose-500"
                                                        : alert.isDueToday
                                                            ? "bg-amber-500/20 text-amber-600"
                                                            : "bg-amber-500/10 text-amber-500"
                                                )}
                                            >
                                                {alert.bill.label}
                                                {alert.isOverdue ? " (OVERDUE)" : alert.isDueToday ? " (TODAY)" : ` (${alert.daysUntilDue}d)`}
                                            </span>
                                        ))}
                                        {billAlerts.length > 4 && (
                                            <span className="text-[10px] font-bold text-muted-foreground">+{billAlerts.length - 4} more</span>
                                        )}
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-xs font-bold shrink-0 group-hover:translate-x-0.5 transition-transform",
                                    overdueCount > 0 ? "text-rose-500" : "text-amber-500"
                                )}>View Bills →</span>
                            </button>
                        </motion.div>
                    )
                })()}

                {/* Wallet Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <WalletCards
                        wallets={wallets}
                        onTransfer={() => setShowTransfer(true)}
                        showAmounts={showAmounts}
                        baseCurrency={baseCurrency}
                        rates={rates}
                        customRates={customRates}
                    />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="flex flex-wrap gap-2"
                >
                    <button
                        onClick={() => setActiveTab("expenses")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-500 transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add Expense
                    </button>
                    <button
                        onClick={() => setActiveTab("expenses")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-500 transition-all"
                    >
                        <Camera className="h-3.5 w-3.5" /> Scan Receipt
                    </button>
                    <button
                        onClick={() => setActiveTab("income")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-500 transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add Income
                    </button>
                    <button
                        onClick={() => setActiveTab("bills")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-500 transition-all"
                    >
                        <Receipt className="h-3.5 w-3.5" /> Pay Bill
                    </button>
                    <button
                        onClick={() => setActiveTab("salary")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl text-xs font-bold text-sky-500 transition-all"
                    >
                        <Calendar className="h-3.5 w-3.5" /> Log Shift
                    </button>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex gap-1.5 bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-1.5 overflow-x-auto scrollbar-none"
                >
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 justify-center",
                                    isActive
                                        ? "bg-background shadow-lg text-foreground font-black"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <tab.icon className={cn("h-4 w-4 shrink-0", isActive && tab.color)} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        )
                    })}
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "income" && (
                                <IncomeSection
                                    entries={entries}
                                    wallets={wallets}
                                    showAmounts={showAmounts}
                                    netSalaryPreset={netSalaryPreset}
                                    onAdd={handleAddEntry}
                                    onDelete={handleDeleteEntry}
                                />
                            )}
                             {activeTab === "expenses" && (
                                <ExpenseSection
                                    entries={entries}
                                    wallets={wallets}
                                    budgets={budgets}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    onAdd={handleAddEntry}
                                    onDelete={handleDeleteEntry}
                                />
                            )}
                            {activeTab === "history" && (
                                <HistorySection
                                    entries={entries}
                                    wallets={wallets}
                                    showAmounts={showAmounts}
                                    onDelete={handleDeleteEntry}
                                />
                            )}
                            {activeTab === "salary" && (
                                <SalarySection
                                    profiles={workProfiles}
                                    timeLogs={timeLogs}
                                    wallets={wallets}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    rates={rates}
                                    deductions={payrollDeductions}
                                    funds={funds}
                                    onFundTransaction={handleFundTransaction}
                                    onAddProfile={handleAddProfile}
                                    onUpdateProfile={handleUpdateProfile}
                                    onDeleteProfile={handleDeleteProfile}
                                    onAddTimeLog={handleAddTimeLog}
                                    onDeleteTimeLog={handleDeleteTimeLog}
                                    onReceiveIncome={async ({ amount, description, wallet_id, currency }) => {
                                        await handleAddEntry({
                                            type: "income",
                                            date: getLocalDateString(),
                                            category: "salary",
                                            description,
                                            amount,
                                            wallet_id,
                                            currency,
                                        })
                                    }}
                                />
                            )}
                            {activeTab === "bills" && (
                                <BillsSection
                                    bills={bills}
                                    wallets={wallets}
                                    entries={entries}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    onAddBill={handleAddBill}
                                    onUpdateBill={handleUpdateBill}
                                    onDeleteBill={handleDeleteBill}
                                    onPayBill={handlePayBill}
                                />
                            )}
                            {activeTab === "debts" && (
                                <DebtSection
                                    debts={debts}
                                    payments={payments}
                                    wallets={wallets}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    onAddDebt={handleAddDebt}
                                    onAddPayment={handleAddPayment}
                                    onDeleteDebt={handleDeleteDebt}
                                />
                            )}
                            {activeTab === "funds" && (
                                <FundsSection
                                    funds={funds}
                                    wallets={wallets}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    onAddFund={handleAddFund}
                                    onFundTransaction={handleFundTransaction}
                                    onDeleteFund={handleDeleteFund}
                                />
                            )}
                            {activeTab === "wishlist" && (
                                <WishlistSection
                                    items={wishlist}
                                    wallets={wallets}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    onAddItem={handleAddWishlistItem}
                                    onPurchaseItem={handlePurchaseWishlistItem}
                                    onDeleteItem={handleDeleteWishlistItem}
                                />
                            )}
                            {activeTab === "reports" && (
                                <ReportsSection
                                    entries={entries}
                                    wallets={wallets}
                                    debts={debts}
                                    funds={funds}
                                    bills={bills}
                                    showAmounts={showAmounts}
                                    baseCurrency={baseCurrency}
                                    rates={rates}
                                    customRates={customRates}
                                />
                            )}
                            {activeTab === "settings" && (
                                <SettingsSection
                                    wallets={wallets}
                                    budgets={budgets}
                                    rates={rates}
                                    customRates={customRates}
                                    baseCurrency={baseCurrency}
                                    showAmounts={showAmounts}
                                    profiles={workProfiles}
                                    deductions={payrollDeductions}
                                    entries={entries}
                                    debts={debts}
                                    payments={payments}
                                    bills={bills}
                                    wishlist={wishlist}
                                    funds={funds}
                                    timeLogs={timeLogs}
                                    onAddWallet={handleAddWallet}
                                    onUpdateWallet={handleUpdateWallet}
                                    onDeleteWallet={handleDeleteWallet}
                                    onAddBudget={handleAddBudget}
                                    onDeleteBudget={handleDeleteBudget}
                                    onUpdateRates={(newRates, newCustom) => {
                                        setRates(newRates)
                                        setCustomRates(newCustom)
                                    }}
                                    onUpdateBaseCurrency={newCurr => setBaseCurrency(newCurr)}
                                    onAddDeduction={handleAddDeduction}
                                    onDeleteDeduction={handleDeleteDeduction}
                                    onToggleDeduction={handleToggleDeduction}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Transfer Modal */}
            <Modal
                isOpen={showTransfer}
                onClose={() => setShowTransfer(false)}
                title="Transfer Between Wallets"
                className="max-w-md"
            >
                {(() => {
                    const fromW = wallets.find(w => w.id === transferData.from)
                    const toW = wallets.find(w => w.id === transferData.to)
                    const fromCurr = fromW?.currency || "PHP"
                    const toCurr = toW?.currency || "PHP"
                    const amt = parseFloat(transferData.amount || "0")
                    const feeAmt = parseFloat(transferData.fee || "0")
                    const totalDeduction = amt + feeAmt
                    const isOverdraft = fromW ? totalDeduction > fromW.balance : false

                    return (
                        <form onSubmit={handleTransfer} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">From Wallet</label>
                                <select
                                    value={transferData.from}
                                    onChange={e => setTransferData({ ...transferData, from: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    required
                                >
                                    <option value="">Select wallet...</option>
                                    {wallets.map(w => {
                                        const wCurr = w.currency || "PHP"
                                        const flag = CURRENCIES[wCurr]?.flag || "🇵🇭"
                                        return (
                                            <option key={w.id} value={w.id}>
                                                {flag} {w.name} ({formatCurrency(w.balance, wCurr, showAmounts)})
                                            </option>
                                        )
                                    })}
                                </select>
                                {/* From Wallet Balance Badge */}
                                {fromW && (
                                    <div className={cn(
                                        "mt-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between",
                                        fromW.balance <= 0
                                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-500"
                                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                                    )}>
                                        <span>Current Balance:</span>
                                        <span className="font-black tabular-nums">{formatCurrency(fromW.balance, fromCurr, showAmounts)}</span>
                                    </div>
                                )}
                                {fromW && fromW.balance <= 0 && (
                                    <p className="text-[10px] text-rose-500/80 font-medium mt-1">This wallet has no funds. Add income or adjust balance in Settings first.</p>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setTransferData({ ...transferData, from: transferData.to, to: transferData.from })}
                                    className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-all text-muted-foreground hover:text-foreground"
                                    title="Swap Wallets"
                                >
                                    <ArrowRightLeft className="h-4 w-4" />
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">To Wallet</label>
                                <select
                                    value={transferData.to}
                                    onChange={e => setTransferData({ ...transferData, to: e.target.value })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    required
                                >
                                    <option value="">Select wallet...</option>
                                    {wallets.filter(w => w.id !== transferData.from).map(w => {
                                        const wCurr = w.currency || "PHP"
                                        const flag = CURRENCIES[wCurr]?.flag || "🇵🇭"
                                        return (
                                            <option key={w.id} value={w.id}>
                                                {flag} {w.name} ({formatCurrency(w.balance, wCurr, showAmounts)})
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex justify-between items-center">
                                    <span>Amount to Transfer ({CURRENCIES[fromCurr]?.symbol || "₱"})</span>
                                    {fromW && fromW.balance > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setTransferData({ ...transferData, amount: fromW.balance.toString() })}
                                            className="text-[10px] text-primary font-bold hover:text-primary/80 hover:underline transition-colors cursor-pointer"
                                        >
                                            Use Max: {formatCurrency(fromW.balance, fromCurr, showAmounts)}
                                        </button>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0.000001"
                                    placeholder="0.00"
                                    value={transferData.amount}
                                    onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                                    className={cn(
                                        "w-full px-3 py-2 bg-background border rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2",
                                        isOverdraft ? "border-rose-500/60 focus:ring-rose-500/20" : "border-border/60 focus:ring-primary/20 focus:border-primary"
                                    )}
                                    required
                                />
                            </div>

                            {/* Overdraft Warning Banner */}
                            {isOverdraft && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
                                    <span className="font-black">❌ Amount exceeds available balance!</span>
                                </div>
                            )}

                            {/* Conversion Rate Preview & Editable Rate Field if transferring across different currencies */}
                            {fromW && toW && fromCurr !== toCurr && (() => {
                                const defaultDirectRate = getDirectRate(fromCurr, toCurr, rates, customRates)
                                const customRateVal = parseFloat(transferData.customRate)
                                const effectiveRate = !isNaN(customRateVal) && customRateVal > 0 ? customRateVal : defaultDirectRate
                                const recipientAmount = amt * effectiveRate

                                return (
                                    <div className="bg-card/80 border border-primary/20 rounded-xl p-3 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                <Globe className="h-3.5 w-3.5 text-primary" />
                                                Exchange Rate (1 {fromCurr} = {CURRENCIES[toCurr]?.symbol || ""})
                                            </label>
                                            {transferData.customRate !== "" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTransferData(prev => ({ ...prev, customRate: "" }))}
                                                    className="text-[10px] text-primary font-bold hover:underline"
                                                >
                                                    Reset to Live Rate
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="any"
                                                min="0.00000001"
                                                placeholder={defaultDirectRate.toString()}
                                                value={transferData.customRate !== "" ? transferData.customRate : defaultDirectRate.toString()}
                                                onChange={e => setTransferData({ ...transferData, customRate: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                        {amt > 0 && (
                                            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-2.5 text-xs text-sky-500 font-medium text-center">
                                                <span>Recipient receives: </span>
                                                <span className="font-black tabular-nums text-sm">{formatCurrency(recipientAmount, toCurr, showAmounts)}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Fee ({CURRENCIES[fromCurr]?.symbol}, optional)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        placeholder="0.00"
                                        value={transferData.fee}
                                        onChange={e => setTransferData({ ...transferData, fee: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Notes (optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Remittance"
                                        value={transferData.notes}
                                        onChange={e => setTransferData({ ...transferData, notes: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button
                                    type="button"
                                    onClick={() => setShowTransfer(false)}
                                    className="flex-1 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!transferData.from || !transferData.to || transferData.from === transferData.to || !transferData.amount || isOverdraft}
                                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/20"
                                >
                                    Transfer
                                </Button>
                            </div>
                        </form>
                    )
                })()}
            </Modal>
        </div>
    )
}
