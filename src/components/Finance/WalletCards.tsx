import { motion } from "framer-motion"
import { Building, Smartphone, Banknote, ArrowRightLeft, Wallet, HelpCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import type { Wallet as WalletType } from "./types"

interface WalletCardsProps {
    wallets: WalletType[]
    onTransfer: () => void
    showAmounts?: boolean
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

function formatPeso(amount: number, showAmounts = true): string {
    if (!showAmounts) return "₱ ••••••"
    return `₱${Math.abs(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function WalletCards({ wallets, onTransfer, showAmounts = true }: WalletCardsProps) {
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

    return (
        <div className="space-y-4">
            {/* Total Balance Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Balance</p>
                        <p className={cn(
                            "text-2xl font-black tabular-nums tracking-tight",
                            totalBalance >= 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                            {totalBalance < 0 && showAmounts && "-"}{formatPeso(totalBalance, showAmounts)}
                        </p>
                    </div>
                </div>
                {wallets.length >= 2 && (
                    <button
                        onClick={onTransfer}
                        className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/40 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        <span>Transfer</span>
                    </button>
                )}
            </div>

            {/* Wallet Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {wallets.map((wallet, index) => {
                    const Icon = WALLET_ICONS[wallet.icon] || HelpCircle
                    const colors = getWalletTheme(wallet.name, wallet.icon)

                    return (
                        <motion.div
                            key={wallet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={cn(
                                "relative overflow-hidden bg-card/60 backdrop-blur-sm border rounded-2xl p-4 shadow-md transition-all hover:shadow-lg",
                                colors.border,
                                colors.glow
                            )}
                        >
                            {/* Background glow */}
                            <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none", colors.bg)} />

                            <div className="relative flex items-center gap-3">
                                <div className={cn("p-2.5 rounded-xl", colors.bg)}>
                                    <Icon className={cn("h-5 w-5", colors.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                                        {wallet.name}
                                    </p>
                                    <p className={cn(
                                        "text-lg font-black tabular-nums tracking-tight",
                                        wallet.balance >= 0 ? "text-foreground" : "text-rose-500"
                                    )}>
                                        {wallet.balance < 0 && showAmounts && "-"}{formatPeso(wallet.balance, showAmounts)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

