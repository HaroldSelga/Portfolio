export interface Wallet {
    id: string
    name: string
    icon: string
    balance: number
    created_at: string
}

export interface FinanceEntry {
    id: string
    type: "income" | "expense"
    date: string
    category: string
    description: string
    amount: number
    wallet_id: string
    created_at: string
}

export interface Debt {
    id: string
    label: string
    total_amount: number
    paid_amount: number
    is_settled: boolean
    created_at: string
}

export interface DebtPayment {
    id: string
    debt_id: string
    date: string
    amount: number
    notes: string | null
    created_at: string
}

export interface BillTemplate {
    id: string
    label: string
    category: string
    amount: number
    created_at: string
}

export const EXPENSE_CATEGORIES = [
    { value: "food", label: "Food", emoji: "🍜" },
    { value: "transport", label: "Transport", emoji: "🚗" },
    { value: "bills", label: "Bills", emoji: "📱" },
    { value: "shopping", label: "Shopping", emoji: "🛍️" },
    { value: "allowance", label: "Allowance", emoji: "👨‍👩‍👧" },
    { value: "health", label: "Health", emoji: "🏥" },
    { value: "entertainment", label: "Entertainment", emoji: "🎮" },
    { value: "debt_payment", label: "Debt Payment", emoji: "💳" },
    { value: "other", label: "Other", emoji: "📦" },
] as const

export const INCOME_CATEGORIES = [
    { value: "salary", label: "Monthly Salary", emoji: "💰" },
    { value: "freelance", label: "Freelance", emoji: "💻" },
    { value: "bonus", label: "Bonus", emoji: "🎁" },
    { value: "refund", label: "Refund", emoji: "🔄" },
    { value: "other", label: "Other", emoji: "📦" },
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]["value"]
export type IncomeCategory = typeof INCOME_CATEGORIES[number]["value"]
