export type CurrencyCode = "PHP" | "NTD" | "USD" | "EUR" | "JPY" | "GBP" | "CAD" | "AUD" | "SGD" | "HKD" | "KRW" | "BTC" | "ETH" | "USDT" | "SOL"

export interface CurrencyConfig {
    code: CurrencyCode
    symbol: string
    name: string
    flag: string
    decimals: number
    isCrypto?: boolean
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    PHP: { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭", decimals: 2 },
    NTD: { code: "NTD", symbol: "NT$", name: "New Taiwan Dollar", flag: "🇹🇼", decimals: 2 },
    USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", decimals: 2 },
    EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", decimals: 2 },
    JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", decimals: 0 },
    GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", decimals: 2 },
    CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦", decimals: 2 },
    AUD: { code: "AUD", symbol: "AU$", name: "Australian Dollar", flag: "🇦🇺", decimals: 2 },
    SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", decimals: 2 },
    HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰", decimals: 2 },
    KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷", decimals: 0 },
    BTC: { code: "BTC", symbol: "₿", name: "Bitcoin", flag: "🪙", decimals: 6, isCrypto: true },
    ETH: { code: "ETH", symbol: "Ξ", name: "Ethereum", flag: "🔷", decimals: 4, isCrypto: true },
    USDT: { code: "USDT", symbol: "₮", name: "Tether USD", flag: "💵", decimals: 2, isCrypto: true },
    SOL: { code: "SOL", symbol: "◎", name: "Solana", flag: "🟣", decimals: 4, isCrypto: true },
}

export interface Wallet {
    id: string
    name: string
    icon: string
    balance: number
    currency?: CurrencyCode
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
    currency?: CurrencyCode
    exchange_rate?: number
    notes?: string
    created_at: string
}

export function formatCurrency(
    amount: number,
    currencyCode: CurrencyCode = "PHP",
    showAmounts: boolean = true
): string {
    if (!showAmounts) {
        const symbol = CURRENCIES[currencyCode]?.symbol || "₱"
        return `${symbol} ••••••`
    }

    const config = CURRENCIES[currencyCode] || CURRENCIES.PHP
    const absAmount = Math.abs(amount)
    
    // Custom number formatting based on decimals
    const formattedNumber = absAmount.toLocaleString("en-US", {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
    })

    return `${config.symbol}${formattedNumber}`
}

export function formatPeso(amount: number, showAmounts: boolean = true): string {
    return formatCurrency(amount, "PHP", showAmounts)
}

export interface Debt {
    id: string
    label: string
    total_amount: number
    paid_amount: number
    is_settled: boolean
    interest_rate?: number
    due_date?: string
    min_monthly_payment?: number
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
    due_day: number | null
    penalty_amount: number | null
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
    url?: string
    is_purchased: boolean
    purchased_date: string | null
    wallet_id: string | null
    created_at: string
}

export interface SavingsFund {
    id: string
    label: string
    target_amount: number
    current_amount: number
    target_date: string | null
    notes: string | null
    created_at: string
}

export interface CategoryBudget {
    id: string
    category: string
    limit_amount: number
    created_at: string
}

// ═══════════════════════════════════════════
// SALARY CALCULATOR TYPES
// ═══════════════════════════════════════════

export type WorkCountry = "TW" | "PH"
export type ScheduleType = "2-2" | "3-3" | "4-2" | "4-3" | "5-2" | "6-1" | "3-shift" | "custom"
export type RateType = "hourly" | "monthly"
export type DayType = 
    | "regular" 
    | "rest_day" 
    | "mandatory_off"
    | "regular_holiday" 
    | "special_holiday" 
    | "rest_day_holiday"
    | "typhoon_disaster_day"
    | "paid_leave"
    | "sick_leave"
    | "unpaid_leave"

export interface WorkProfile {
    id: string
    label: string
    country: WorkCountry
    schedule_type: ScheduleType
    shift_hours: number
    rate_type: RateType
    base_rate: number
    custom_monthly_hours?: number
    custom_work_days?: number
    custom_rest_days?: number
    unpaid_break_minutes?: number
    currency: CurrencyCode
    wallet_id: string | null
    cycle_start_date: string | null
    year_end_bonus_multiplier: number
    created_at: string
}

export interface TimeLog {
    id: string
    profile_id: string
    date: string
    time_in: string
    time_out: string
    break_minutes?: number
    day_type: DayType
    notes: string | null
    created_at: string
}

export interface DayPayBreakdown {
    date: string
    dayType: DayType
    timeIn: string
    timeOut: string
    totalHours: number
    regularHours: number
    overtimeHours: number
    nightHours: number
    regularPay: number
    overtimePay: number
    nightPay: number
    holidayPremium: number
    totalPay: number
}

export interface PayrollSummary {
    totalDaysWorked: number
    totalRegularHours: number
    totalOvertimeHours: number
    totalNightHours: number
    totalRegularPay: number
    totalOvertimePay: number
    totalNightPay: number
    totalHolidayPremium: number
    grossPay: number
    taxWithheld: number
    totalDeductions: number
    deductionBreakdown: { label: string; amount: number }[]
    netPay: number
    thirteenthMonthAccrued: number
    yearEndBonusEstimate: number
    days: DayPayBreakdown[]
}

export interface PayrollDeduction {
    id: string
    profile_id: string
    label: string
    amount: number
    frequency: "monthly" | "kinsenas"
    is_active: boolean
    created_at: string
}

export type KinsenasPeriod = "full" | "kinsenas1" | "kinsenas2"

export interface TaxEstimate {
    annualGross: number
    totalDeductions: number
    taxableIncome: number
    actualTaxOwed: number
    totalWithheld: number
    estimatedRefund: number
    effectiveRate: number
    withholdingRate: number
    isResident: boolean
    daysInCountry: number
    thirteenthMonth: number
    thirteenthMonthTaxable: number
    yearEndBonus: number
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
    { value: "savings_deposit", label: "Savings Deposit", emoji: "🐷" },
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
    { value: "savings_withdraw", label: "Savings Withdrawal", emoji: "💵" },
    { value: "transfer", label: "Transfer", emoji: "🔄" },
    { value: "debt_received", label: "Debt Received / Collected", emoji: "🤝" },
    { value: "platform_earnings", label: "Platform Earnings (TikTok, YouTube, etc.)", emoji: "📱" },
    { value: "cashout", label: "Cashout / Withdrawal (GCash, Maya, etc.)", emoji: "🏧" },
    { value: "commission", label: "Commission", emoji: "🤑" },
    { value: "tips", label: "Tips / Gratitudes", emoji: "🙏" },
    { value: "rental_income", label: "Rental Income", emoji: "🏠" },
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

/**
 * Helper to get local YYYY-MM-DD date string without UTC timezone offset shift
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/**
 * Helper to select default smart wallet:
 * 1. Prefers wallets with balance > 0 (or balance >= minAmount).
 * 2. Prioritizes 'Cash on Hand' or 'Cash' wallet first.
 * 3. Fallbacks to wallet with highest balance or first wallet.
 */
export function getDefaultSmartWallet(wallets: Wallet[], minAmount: number = 0): string {
    if (!wallets || wallets.length === 0) return ""

    // 1. Wallets with sufficient balance
    const funded = wallets.filter(w => w.balance > minAmount)
    const pool = funded.length > 0 ? funded : wallets

    // 2. Look for "Cash on Hand" or "Cash" in pool
    const cashWallet = pool.find(w => {
        const name = w.name.toLowerCase()
        return name.includes("cash on hand") || name.includes("cash")
    })
    if (cashWallet) return cashWallet.id

    // 3. Otherwise pick wallet with highest balance
    const highest = [...pool].sort((a, b) => b.balance - a.balance)[0]
    return highest?.id || wallets[0]?.id || ""
}
