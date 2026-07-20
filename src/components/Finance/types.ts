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
    wallet_id: string | null
    created_at: string
}

export interface BillTemplate {
    id: string
    label: string
    category: string
    amount: number
    created_at: string
}

export interface WishlistItem {
    id: string
    label: string
    estimated_price: number
    actual_price: number | null
    priority: "low" | "medium" | "high"
    notes: string | null
    target_date: string | null
    is_purchased: boolean
    purchased_date: string | null
    wallet_id: string | null
    created_at: string
}

export const EXPENSE_CATEGORIES = [
    { value: "food", label: "Food", emoji: "🍜" },
    { value: "groceries", label: "Groceries", emoji: "🛒" },
    { value: "transport", label: "Transport", emoji: "🚗" },
    { value: "gas_fuel", label: "Gas/Fuel", emoji: "⛽" },
    { value: "bills", label: "Bills", emoji: "📱" },
    { value: "rent_housing", label: "Rent/Housing", emoji: "🏠" },
    { value: "shopping", label: "Shopping", emoji: "🛍️" },
    { value: "clothing", label: "Clothing", emoji: "👕" },
    { value: "allowance", label: "Allowance", emoji: "👨‍👩‍👧" },
    { value: "health", label: "Health", emoji: "🏥" },
    { value: "personal_care", label: "Personal Care", emoji: "💇" },
    { value: "education", label: "Education", emoji: "📚" },
    { value: "entertainment", label: "Entertainment", emoji: "🎮" },
    { value: "subscriptions", label: "Subscriptions", emoji: "📺" },
    { value: "insurance", label: "Insurance", emoji: "💼" },
    { value: "gifts_given", label: "Gifts Given", emoji: "🎁" },
    { value: "pets", label: "Pets", emoji: "🐾" },
    { value: "repairs", label: "Repairs/Maintenance", emoji: "🔧" },
    { value: "debt_payment", label: "Debt Payment", emoji: "💳" },
    { value: "wishlist", label: "Wishlist Purchase", emoji: "🎯" },
    { value: "transfer", label: "Transfer", emoji: "🔄" },
    { value: "other", label: "Other", emoji: "📦" },
] as const

export const INCOME_CATEGORIES = [
    { value: "salary", label: "Monthly Salary", emoji: "💰" },
    { value: "freelance", label: "Freelance", emoji: "💻" },
    { value: "side_hustle", label: "Side Hustle", emoji: "💵" },
    { value: "bonus", label: "Bonus", emoji: "🎁" },
    { value: "investment", label: "Investment Returns", emoji: "📈" },
    { value: "gift_received", label: "Gift Received", emoji: "🎁" },
    { value: "allowance_received", label: "Allowance Received", emoji: "👨‍👩‍👧" },
    { value: "sold_items", label: "Sold Items", emoji: "🏪" },
    { value: "refund", label: "Refund", emoji: "🔄" },
    { value: "transfer", label: "Transfer", emoji: "🔄" },
    { value: "other", label: "Other", emoji: "📦" },
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]["value"]
export type IncomeCategory = typeof INCOME_CATEGORIES[number]["value"]

// Wallet icon/type presets
export const WALLET_TYPES = [
    { value: "building", label: "Bank", emoji: "🏦" },
    { value: "smartphone", label: "E-Wallet", emoji: "📱" },
    { value: "banknote", label: "Cash", emoji: "💵" },
] as const

export const WALLET_PRESETS = {
    banks: [
        { name: "BDO", icon: "building" },
        { name: "BPI", icon: "building" },
        { name: "EastWest", icon: "building" },
        { name: "China Bank", icon: "building" },
        { name: "Metrobank", icon: "building" },
        { name: "UnionBank", icon: "building" },
        { name: "LandBank", icon: "building" },
        { name: "PNB", icon: "building" },
        { name: "Security Bank", icon: "building" },
        { name: "RCBC", icon: "building" },
    ],
    ewallets: [
        { name: "GCash", icon: "smartphone" },
        { name: "Maya", icon: "smartphone" },
        { name: "ShopeePay", icon: "smartphone" },
        { name: "GrabPay", icon: "smartphone" },
        { name: "Coins.ph", icon: "smartphone" },
    ],
    cash: [
        { name: "Cash on Hand", icon: "banknote" },
        { name: "Savings Jar", icon: "banknote" },
        { name: "Emergency Fund", icon: "banknote" },
    ],
} as const
