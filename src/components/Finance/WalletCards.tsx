import { motion } from "framer-motion"
import { Building, Smartphone, Banknote, ArrowRightLeft, Wallet, HelpCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import type { Wallet as WalletType, CurrencyCode } from "./types"
import { CURRENCIES, formatCurrency } from "./types"
import { convertCurrency, DEFAULT_RATES_IN_USD, type ExchangeRates } from "./currency"

interface WalletCardsProps {
    wallets: WalletType[]
    onTransfer: () => void
    showAmounts?: boolean
    baseCurrency?: CurrencyCode
    rates?: ExchangeRates
    customRates?: Partial<ExchangeRates>
}

const WALLET_ICONS: Record<string, React.ElementType> = {
    building: Building,
    smartphone: Smartphone,
    banknote: Banknote,
}

// Preset color themes mapping matching Philippine brands and wallet types
const BRAND_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    gcash: {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        border: "border-blue-500/20",
        glow: "shadow-blue-500/10",
    },
    maya: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/20",
        glow: "shadow-emerald-500/10",
    },
    bdo: {
        bg: "bg-amber-500/10",
        text: "text-amber-500",
        border: "border-amber-500/20",
        glow: "shadow-amber-500/10",
    },
    bpi: {
        bg: "bg-rose-500/10",
        text: "text-rose-600",
        border: "border-rose-500/20",
        glow: "shadow-rose-500/10",
    },
    eastwest: {
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        border: "border-purple-500/20",
        glow: "shadow-purple-500/10",
    },
    unionbank: {
        bg: "bg-orange-500/10",
        text: "text-orange-500",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/10",
    },
    chinabank: {
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/20",
        glow: "shadow-red-500/10",
    },
    shopeepay: {
        bg: "bg-orange-500/10",
        text: "text-orange-600",
        border: "border-orange-500/20",
        glow: "shadow-orange-500/10",
    },
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    building: {
        bg: "bg-indigo-500/10",
        text: "text-indigo-500",
        border: "border-indigo-500/20",
        glow: "shadow-indigo-500/10",
    },
    smartphone: {
        bg: "bg-sky-500/10",
        text: "text-sky-500",
        border: "border-sky-500/20",
        glow: "shadow-sky-500/10",
    },
    banknote: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/20",
        glow: "shadow-emerald-500/10",
    },
}

function getWalletTheme(name: string, icon: string) {
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, "")
    for (const key in BRAND_COLORS) {
        if (cleanName.includes(key)) {
            return BRAND_COLORS[key]
        }
    }
    return TYPE_COLORS[icon] || {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/20",
        glow: "shadow-primary/10",
    }
}

export function WalletCards({
    wallets,
    onTransfer,
    showAmounts = true,
    baseCurrency = "PHP",
    rates = DEFAULT_RATES_IN_USD,
    customRates = {}
}: WalletCardsProps) {
    // Calculate total net balance converted into base currency
    const totalInBase = wallets.reduce((sum, w) => {
        const curr = w.currency || "PHP"
        const converted = convertCurrency(w.balance, curr, baseCurrency, rates, customRates)
        return sum + converted
    }, 0)

    const baseConfig = CURRENCIES[baseCurrency] || CURRENCIES.PHP

    return (
        <div className="space-y-4">
            {/* Total Balance Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            Total Portfolio Balance <span className="text-[10px] px-1.5 py-0.2 bg-muted rounded font-black">{baseConfig.flag} {baseCurrency}</span>
                        </p>
                        <p className={cn(
                            "text-xl sm:text-2xl font-black tabular-nums tracking-tight",
                            totalInBase >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {totalInBase < 0 && showAmounts && "-"}{formatCurrency(totalInBase, baseCurrency, showAmounts)}
                        </p>
                    </div>
                </div>
                {wallets.length >= 2 && (
                    <button
                        onClick={onTransfer}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/40 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all shadow-sm self-start sm:self-auto"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Transfer</span>
                    </button>
                )}
            </div>

            {/* Wallet Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {wallets.map((wallet, index) => {
                    const Icon = WALLET_ICONS[wallet.icon] || HelpCircle
                    const colors = getWalletTheme(wallet.name, wallet.icon)
                    const currencyCode = wallet.currency || "PHP"
                    const currInfo = CURRENCIES[currencyCode] || CURRENCIES.PHP
                    
                    const isDifferentFromBase = currencyCode !== baseCurrency
                    const convertedVal = isDifferentFromBase
                        ? convertCurrency(wallet.balance, currencyCode, baseCurrency, rates, customRates)
                        : wallet.balance

                    return (
                        <motion.div
                            key={wallet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={cn(
                                "relative overflow-hidden bg-card/60 backdrop-blur-sm border rounded-2xl p-4 shadow-md transition-all hover:shadow-lg flex flex-col justify-between gap-2",
                                colors.border,
                                colors.glow
                            )}
                        >
                            {/* Background glow */}
                            <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none", colors.bg)} />

                            <div className="relative flex items-start gap-3">
                                <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", colors.bg)}>
                                    <Icon className={cn("h-5 w-5", colors.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                                            {wallet.name}
                                        </p>
                                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-muted/80 rounded-md text-foreground/80 shrink-0">
                                            {currInfo.flag} {currencyCode}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-lg font-black tabular-nums tracking-tight mt-0.5",
                                        wallet.balance >= 0 ? "text-foreground" : "text-rose-500"
                                    )}>
                                        {wallet.balance < 0 && showAmounts && "-"}{formatCurrency(wallet.balance, currencyCode, showAmounts)}
                                    </p>

                                    {/* Secondary converted base currency display */}
                                    {isDifferentFromBase && (
                                        <p className="text-[11px] font-bold text-muted-foreground/80 tabular-nums mt-0.5">
                                            ≈ {convertedVal < 0 && showAmounts && "-"}{formatCurrency(convertedVal, baseCurrency, showAmounts)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
