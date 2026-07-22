import { useState, useEffect, useCallback } from "react"
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
    EyeOff
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
import type { Wallet, FinanceEntry, Debt, DebtPayment, BillTemplate, WishlistItem, SavingsFund, CategoryBudget } from "./types"

type Tab = "income" | "expenses" | "history" | "bills" | "debts" | "funds" | "wishlist" | "reports" | "settings"

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
    { key: "income", label: "Income", icon: TrendingUp, color: "text-emerald-500" },
    { key: "expenses", label: "Expenses", icon: TrendingDown, color: "text-rose-500" },
    { key: "history", label: "History", icon: HistoryIcon, color: "text-stone-400" },
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
    const [wallets, setWallets] = useState<Wallet[]>([])
    const [entries, setEntries] = useState<FinanceEntry[]>([])
    const [debts, setDebts] = useState<Debt[]>([])
    const [payments, setPayments] = useState<DebtPayment[]>([])
    const [bills, setBills] = useState<BillTemplate[]>([])
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [funds, setFunds] = useState<SavingsFund[]>([])
    const [budgets, setBudgets] = useState<CategoryBudget[]>([])
    
    const [useLocalStorageWishlist, setUseLocalStorageWishlist] = useState(false)
    const [useLocalStorageFunds, setUseLocalStorageFunds] = useState(false)
    const [useLocalStorageBudgets, setUseLocalStorageBudgets] = useState(false)

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
    })

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
            const { data, error } = await supabase
                .from("finance_entries")
                .insert(entry)
                .select()
                .single()

            if (error) throw error

            // Update wallet balance
            const wallet = wallets.find(w => w.id === entry.wallet_id)
            if (wallet) {
                const newBalance = entry.type === "income"
                    ? wallet.balance + entry.amount
                    : wallet.balance - entry.amount

                await supabase
                    .from("wallets")
                    .update({ balance: newBalance })
                    .eq("id", entry.wallet_id)

                setWallets(prev => prev.map(w =>
                    w.id === entry.wallet_id ? { ...w, balance: newBalance } : w
                ))
            }

            if (data) setEntries(prev => [data, ...prev])
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

            // Reverse wallet balance
            const wallet = wallets.find(w => w.id === entry.wallet_id)
            if (wallet) {
                const newBalance = entry.type === "income"
                    ? wallet.balance - entry.amount
                    : wallet.balance + entry.amount

                await supabase
                    .from("wallets")
                    .update({ balance: newBalance })
                    .eq("id", entry.wallet_id)

                setWallets(prev => prev.map(w =>
                    w.id === entry.wallet_id ? { ...w, balance: newBalance } : w
                ))
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
                .insert({ ...debt, paid_amount: 0, is_settled: false })
                .select()
                .single()

            if (error) throw error
            if (data) setDebts(prev => [...prev, data])
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
            date: new Date().toISOString().split("T")[0],
            category: bill.category,
            description,
            amount: bill.amount,
            wallet_id: walletId,
        })
    }

    // Transfer between wallets
    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        const { from, to, amount: amtStr } = transferData
        const amount = parseFloat(amtStr)
        if (!from || !to || from === to || !amount || amount <= 0) return

        try {
            const fromWallet = wallets.find(w => w.id === from)
            const toWallet = wallets.find(w => w.id === to)
            if (!fromWallet || !toWallet) return

            await handleAddEntry({
                type: "expense",
                date: new Date().toISOString().split("T")[0],
                category: "transfer",
                description: `Transfer to ${toWallet.name}`,
                amount: amount,
                wallet_id: from,
            })

            await handleAddEntry({
                type: "income",
                date: new Date().toISOString().split("T")[0],
                category: "transfer",
                description: `Transfer from ${fromWallet.name}`,
                amount: amount,
                wallet_id: to,
            })

            setTransferData({ from: "", to: "", amount: "" })
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
            date: new Date().toISOString().split("T")[0],
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
        <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-start justify-between gap-4"
                >
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
                            Finance <span className="text-primary">Tracker</span>
                        </h1>
                        <p className="text-muted-foreground font-medium max-w-xl">
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

                {/* Wallet Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <WalletCards wallets={wallets} onTransfer={() => setShowTransfer(true)} showAmounts={showAmounts} />
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex gap-1 bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-1.5 overflow-x-auto scrollbar-none"
                >
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 justify-center",
                                    isActive
                                        ? "bg-background shadow-lg text-foreground font-black"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <tab.icon className={cn("h-4 w-4 shrink-0", isActive && tab.color)} />
                                <span>{tab.label}</span>
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
                                    onAdd={handleAddEntry}
                                    onDelete={handleDeleteEntry}
                                />
                            )}
                             {activeTab === "expenses" && (
                                <ExpenseSection
                                    entries={entries}
                                    wallets={wallets}
                                    budgets={budgets}
                                    onAdd={handleAddEntry}
                                    onDelete={handleDeleteEntry}
                                />
                            )}
                            {activeTab === "history" && (
                                <HistorySection
                                    entries={entries}
                                    wallets={wallets}
                                    onDelete={handleDeleteEntry}
                                />
                            )}
                            {activeTab === "bills" && (
                                <BillsSection
                                    bills={bills}
                                    wallets={wallets}
                                    entries={entries}
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
                                    onAddDebt={handleAddDebt}
                                    onAddPayment={handleAddPayment}
                                    onDeleteDebt={handleDeleteDebt}
                                />
                            )}
                            {activeTab === "funds" && (
                                <FundsSection
                                    funds={funds}
                                    wallets={wallets}
                                    onAddFund={handleAddFund}
                                    onFundTransaction={handleFundTransaction}
                                    onDeleteFund={handleDeleteFund}
                                />
                            )}
                            {activeTab === "wishlist" && (
                                <WishlistSection
                                    items={wishlist}
                                    wallets={wallets}
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
                                />
                            )}
                            {activeTab === "settings" && (
                                <SettingsSection
                                    wallets={wallets}
                                    budgets={budgets}
                                    onAddWallet={handleAddWallet}
                                    onUpdateWallet={handleUpdateWallet}
                                    onDeleteWallet={handleDeleteWallet}
                                    onAddBudget={handleAddBudget}
                                    onDeleteBudget={handleDeleteBudget}
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
                <form onSubmit={handleTransfer} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">From</label>
                        <select
                            value={transferData.from}
                            onChange={e => setTransferData({ ...transferData, from: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        >
                            <option value="">Select wallet...</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({formatPeso(w.balance)})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center">
                        <div className="p-2 bg-muted rounded-full">
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">To</label>
                        <select
                            value={transferData.to}
                            onChange={e => setTransferData({ ...transferData, to: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        >
                            <option value="">Select wallet...</option>
                            {wallets.filter(w => w.id !== transferData.from).map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({formatPeso(w.balance)})</option>
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
                            value={transferData.amount}
                            onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={() => setShowTransfer(false)}
                            className="flex-1 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!transferData.from || !transferData.to || transferData.from === transferData.to || !transferData.amount}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            Transfer
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

function formatPeso(amount: number): string {
    return `₱${Math.abs(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
