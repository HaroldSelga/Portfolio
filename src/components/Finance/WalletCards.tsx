import { motion } from "framer-motion"
import { Building, Smartphone, Banknote, ArrowRightLeft, Wallet } from "lucide-react"
import { cn } from "../../lib/utils"
import type { Wallet as WalletType } from "./types"

interface WalletCardsProps {
    wallets: WalletType[]
    onTransfer: () => void
}

const WALLET_ICONS: Record<string, React.ElementType> = {
    building: Building,
    smartphone: Smartphone,
    banknote: Banknote,
}

const WALLET_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    "Bank Account": {
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        border: "border-emerald-500/20",
        glow: "shadow-emerald-500/10",
    },
    "GCash": {
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/20",
        glow: "shadow-primary/10",
    },
    "Cash on Hand": {
        bg: "bg-amber-500/10",
        text: "text-amber-500",
        border: "border-amber-500/20",
        glow: "shadow-amber-500/10",
    },
}

function formatPeso(amount: number): string {
    return `₱${Math.abs(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function WalletCards({ wallets, onTransfer }: WalletCardsProps) {
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
                            {totalBalance < 0 && "-"}{formatPeso(totalBalance)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onTransfer}
                    className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border/40 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
                >
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Transfer</span>
                </button>
            </div>

            {/* Wallet Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {wallets.map((wallet, index) => {
                    const Icon = WALLET_ICONS[wallet.icon] || Wallet
                    const colors = WALLET_COLORS[wallet.name] || {
                        bg: "bg-primary/10",
                        text: "text-primary",
                        border: "border-primary/20",
                        glow: "shadow-primary/10",
                    }

                    return (
                        <motion.div
                            key={wallet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={cn(
                                "relative overflow-hidden bg-card/60 backdrop-blur-sm border rounded-2xl p-4 shadow-lg transition-all hover:shadow-xl",
                                colors.border,
                                colors.glow
                            )}
                        >
                            {/* Background glow */}
                            <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none", colors.bg)} />

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
                                        {wallet.balance < 0 && "-"}{formatPeso(wallet.balance)}
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
