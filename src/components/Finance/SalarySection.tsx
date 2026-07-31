import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Clock,
    Plus,
    Calendar,
    DollarSign,
    Calculator,
    Settings as SettingsIcon,
    Trash2,
    Edit2,
    CheckCircle2,
    TrendingUp,
    Sparkles,
    Briefcase,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { WorkProfile, TimeLog, Wallet, DayType, CurrencyCode } from "./types"
import { CURRENCIES, formatCurrency } from "./types"
import {
    getHourlyRate,
    calculateDayPay,
    calculatePayroll,
    getAutoDayType
} from "./salaryCalculator"
import { estimateTax } from "./taxCalculator"
import { checkHoliday } from "./holidays"

interface SalarySectionProps {
    profiles: WorkProfile[]
    timeLogs: TimeLog[]
    wallets: Wallet[]
    showAmounts: boolean
    baseCurrency: CurrencyCode
    onAddProfile: (profile: Omit<WorkProfile, "id" | "created_at">) => Promise<void>
    onUpdateProfile: (id: string, profile: Partial<WorkProfile>) => Promise<void>
    onDeleteProfile: (id: string) => Promise<void>
    onAddTimeLog: (log: Omit<TimeLog, "id" | "created_at">) => Promise<void>
    onDeleteTimeLog: (id: string) => Promise<void>
    onReceiveIncome: (params: { amount: number; description: string; wallet_id: string; currency: CurrencyCode }) => Promise<void>
}

type SubTab = "timesheet" | "payroll" | "tax" | "profiles"

export function SalarySection({
    profiles,
    timeLogs,
    wallets,
    showAmounts,
    onAddProfile,
    onUpdateProfile,
    onDeleteProfile,
    onAddTimeLog,
    onDeleteTimeLog,
    onReceiveIncome
}: SalarySectionProps) {
    // Active work profile selection
    const [selectedProfileId, setSelectedProfileId] = useState<string>(() => profiles[0]?.id || "")

    // If active profile list changes and current selection invalid, reset
    const activeProfile = useMemo(() => {
        return profiles.find(p => p.id === selectedProfileId) || profiles[0] || null
    }, [profiles, selectedProfileId])

    const [activeSubTab, setActiveSubTab] = useState<SubTab>("timesheet")
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    })

    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [editingProfile, setEditingProfile] = useState<WorkProfile | null>(null)
    const [profileFormData, setProfileFormData] = useState({
        label: "Taiwan Factory (2-2)",
        country: "TW" as "TW" | "PH",
        schedule_type: "2-2" as "2-2" | "5-2" | "custom",
        shift_hours: 12,
        rate_type: "hourly" as "hourly" | "monthly",
        base_rate: 183,
        currency: "NTD" as CurrencyCode,
        wallet_id: "",
        cycle_start_date: new Date().toISOString().split("T")[0],
        year_end_bonus_multiplier: 1.0,
    })

    // TimeLog Form State
    const [showLogModal, setShowLogModal] = useState(false)
    const [logFormData, setLogFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        time_in: "08:00",
        time_out: "20:00",
        day_type: "regular" as DayType,
        notes: "",
    })

    // Tax Estimator Inputs
    const [daysInCountry, setDaysInCountry] = useState<number>(365)
    const [manualAnnualGross] = useState<string>("")

    // Notification feedback state
    const [incomeAddedNotice, setIncomeAddedNotice] = useState<string | null>(null)

    // Filter logs for selected profile & month
    const profileLogs = useMemo(() => {
        if (!activeProfile) return []
        return timeLogs.filter(l => l.profile_id === activeProfile.id)
    }, [timeLogs, activeProfile])

    const monthlyLogs = useMemo(() => {
        return profileLogs.filter(l => l.date.startsWith(selectedMonth))
    }, [profileLogs, selectedMonth])

    // Calculate monthly payroll summary
    const payrollSummary = useMemo(() => {
        if (!activeProfile) return null
        return calculatePayroll(monthlyLogs, activeProfile)
    }, [monthlyLogs, activeProfile])

    // Calculate annual tax estimate
    const taxEstimate = useMemo(() => {
        if (!activeProfile) return null
        // Calculate total gross from all logged time or fallback to manual input/estimate
        const loggedGrossAnnual = profileLogs.reduce((acc, log) => {
            const dayBreakdown = calculateDayPay(log, activeProfile)
            return acc + dayBreakdown.totalPay
        }, 0)

        // If manual gross is set, use it; otherwise use logged gross or projected monthly × 12
        let grossToUse = loggedGrossAnnual
        if (manualAnnualGross && !isNaN(parseFloat(manualAnnualGross))) {
            grossToUse = parseFloat(manualAnnualGross)
        } else if (loggedGrossAnnual === 0 && payrollSummary) {
            grossToUse = payrollSummary.grossPay * 12
        } else if (loggedGrossAnnual === 0) {
            const hRate = getHourlyRate(activeProfile)
            grossToUse = hRate * (activeProfile.shift_hours || 8) * 22 * 12
        }

        return estimateTax(activeProfile, grossToUse, daysInCountry)
    }, [activeProfile, profileLogs, manualAnnualGross, payrollSummary, daysInCountry])

    // Quick profile setup helpers
    const handleQuickPreset = (preset: "TW_2_2" | "PH_5_2") => {
        if (preset === "TW_2_2") {
            setProfileFormData({
                label: "Taiwan Factory (2-2 Shift)",
                country: "TW",
                schedule_type: "2-2",
                shift_hours: 12,
                rate_type: "hourly",
                base_rate: 183, // Standard minimum NTD hourly rate
                currency: "NTD",
                wallet_id: wallets[0]?.id || "",
                cycle_start_date: new Date().toISOString().split("T")[0],
                year_end_bonus_multiplier: 1.0,
            })
        } else {
            setProfileFormData({
                label: "PH Work (5-2 Schedule)",
                country: "PH",
                schedule_type: "5-2",
                shift_hours: 8,
                rate_type: "monthly",
                base_rate: 30000,
                currency: "PHP",
                wallet_id: wallets[0]?.id || "",
                cycle_start_date: "",
                year_end_bonus_multiplier: 1.0,
            })
        }
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingProfile) {
                await onUpdateProfile(editingProfile.id, profileFormData)
            } else {
                await onAddProfile(profileFormData)
            }
            setShowProfileModal(false)
            setEditingProfile(null)
        } catch (err) {
            console.error("Error saving profile:", err)
        }
    }

    const handleSaveLog = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeProfile) return
        try {
            await onAddTimeLog({
                profile_id: activeProfile.id,
                ...logFormData
            })
            setShowLogModal(false)
            setLogFormData({
                date: new Date().toISOString().split("T")[0],
                time_in: "08:00",
                time_out: "20:00",
                day_type: "regular",
                notes: "",
            })
        } catch (err) {
            console.error("Error logging time:", err)
        }
    }

    // Auto-fill time log details when date changes
    const handleLogDateChange = (newDate: string) => {
        if (!activeProfile) {
            setLogFormData(prev => ({ ...prev, date: newDate }))
            return
        }
        const autoType = getAutoDayType(newDate, activeProfile)
        setLogFormData(prev => ({
            ...prev,
            date: newDate,
            day_type: autoType
        }))
    }

    const handleReceiveSalary = async () => {
        if (!payrollSummary || !activeProfile) return
        const walletId = activeProfile.wallet_id || wallets[0]?.id
        if (!walletId) {
            alert("Please select a target wallet in Work Profile settings first.")
            return
        }

        const dateFormatted = new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        const desc = `Salary payout (${dateFormatted}) - ${activeProfile.label}`

        try {
            await onReceiveIncome({
                amount: payrollSummary.netPay,
                description: desc,
                wallet_id: walletId,
                currency: activeProfile.currency
            })
            setIncomeAddedNotice(`Successfully added ${formatCurrency(payrollSummary.netPay, activeProfile.currency, showAmounts)} to your wallet as income!`)
            setTimeout(() => setIncomeAddedNotice(null), 5000)
        } catch (err) {
            console.error("Error receiving income:", err)
        }
    }

    // Navigation month controls
    const handlePrevMonth = () => {
        const [y, m] = selectedMonth.split("-").map(Number)
        const d = new Date(y, m - 2, 1)
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
    }

    const handleNextMonth = () => {
        const [y, m] = selectedMonth.split("-").map(Number)
        const d = new Date(y, m, 1)
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
    }

    return (
        <div className="space-y-6">
            {/* Header & Job Selector */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 md:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-black tracking-tight">Salary & Overtime Calculator</h2>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                            Track time-in/out, Taiwan 2-2 schedules, overtime, night differential & August tax refunds.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Profile selector dropdown */}
                        {profiles.length > 0 && (
                            <select
                                value={selectedProfileId}
                                onChange={e => setSelectedProfileId(e.target.value)}
                                className="px-3 py-2 bg-background border border-border/60 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.country === "TW" ? "🇹🇼" : "🇵🇭"} {p.label} ({p.currency})
                                    </option>
                                ))}
                            </select>
                        )}

                        <Button
                            onClick={() => {
                                setEditingProfile(null)
                                handleQuickPreset("TW_2_2")
                                setShowProfileModal(true)
                            }}
                            className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-primary/20"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" /> Add Job Profile
                        </Button>
                    </div>
                </div>

                {/* Sub-tab navigation */}
                <div className="flex gap-2 mt-5 border-t border-border/30 pt-4 overflow-x-auto scrollbar-none">
                    {[
                        { key: "timesheet", label: "Timesheet Logs", icon: Calendar },
                        { key: "payroll", label: "Payroll Breakdown", icon: Calculator },
                        { key: "tax", label: "Tax & Refund Estimator", icon: DollarSign },
                        { key: "profiles", label: "Job Settings", icon: SettingsIcon },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSubTab(tab.key as SubTab)}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                                activeSubTab === tab.key
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Success Notice */}
            <AnimatePresence>
                {incomeAddedNotice && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-500 text-xs font-bold"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <span>{incomeAddedNotice}</span>
                        </div>
                        <button onClick={() => setIncomeAddedNotice(null)}>
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!activeProfile && activeSubTab !== "profiles" ? (
                <div className="bg-card/60 border border-border/30 rounded-2xl p-10 text-center space-y-3">
                    <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
                    <h3 className="text-base font-bold">No Work Profile Configured</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Create a job profile (e.g. Taiwan 2-2 factory job or Philippines office job) to start calculating your salary and tax refunds.
                    </p>
                    <Button
                        onClick={() => {
                            handleQuickPreset("TW_2_2")
                            setShowProfileModal(true)
                        }}
                        className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1.5"
                    >
                        <Plus className="h-4 w-4" /> Create First Profile
                    </Button>
                </div>
            ) : (
                <>
                    {/* TAB 1: TIMESHEET LOGS */}
                    {activeSubTab === "timesheet" && activeProfile && (
                        <div className="space-y-4">
                            {/* Month Selector Bar */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-1.5 hover:bg-muted rounded-xl transition-all"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-black tracking-tight">
                                        {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                    <button
                                        onClick={handleNextMonth}
                                        className="p-1.5 hover:bg-muted rounded-xl transition-all"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <Button
                                    onClick={() => {
                                        const autoType = getAutoDayType(logFormData.date, activeProfile)
                                        setLogFormData(prev => ({ ...prev, day_type: autoType }))
                                        setShowLogModal(true)
                                    }}
                                    className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-primary/20"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" /> Log Shift
                                </Button>
                            </div>

                            {/* Monthly Quick Stats */}
                            {payrollSummary && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Days Logged</span>
                                        <span className="text-lg font-black tabular-nums">{payrollSummary.totalDaysWorked} days</span>
                                    </div>
                                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total OT Hours</span>
                                        <span className="text-lg font-black tabular-nums text-amber-500">{payrollSummary.totalOvertimeHours.toFixed(1)} hrs</span>
                                    </div>
                                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Night Shift Hrs</span>
                                        <span className="text-lg font-black tabular-nums text-indigo-400">{payrollSummary.totalNightHours.toFixed(1)} hrs</span>
                                    </div>
                                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-3.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Gross Month Pay</span>
                                        <span className="text-lg font-black tabular-nums text-emerald-500">
                                            {formatCurrency(payrollSummary.grossPay, activeProfile.currency, showAmounts)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Logs List Table */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logged Shifts ({monthlyLogs.length})</h3>

                                {monthlyLogs.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground text-xs font-medium">
                                        No time logs recorded for {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long" })}. Click "Log Shift" above to add your time.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {monthlyLogs.map(log => {
                                            const dayCalc = calculateDayPay(log, activeProfile)
                                            return (
                                                <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={cn(
                                                            "p-2 rounded-xl shrink-0 font-bold text-center w-12",
                                                            log.day_type === "regular" && "bg-emerald-500/10 text-emerald-500",
                                                            log.day_type === "rest_day" && "bg-amber-500/10 text-amber-500",
                                                            (log.day_type === "regular_holiday" || log.day_type === "special_holiday") && "bg-rose-500/10 text-rose-500"
                                                        )}>
                                                            <div className="text-[10px] uppercase font-bold">
                                                                {new Date(log.date).toLocaleDateString("en-US", { weekday: "short" })}
                                                            </div>
                                                            <div className="text-xs font-black">
                                                                {new Date(log.date).getDate()}
                                                            </div>
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold">{log.time_in} – {log.time_out}</span>
                                                                <span className={cn(
                                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                                    log.day_type === "regular" && "bg-emerald-500/20 text-emerald-500",
                                                                    log.day_type === "rest_day" && "bg-amber-500/20 text-amber-500",
                                                                    log.day_type === "regular_holiday" && "bg-rose-500/20 text-rose-500",
                                                                    log.day_type === "special_holiday" && "bg-purple-500/20 text-purple-500",
                                                                    log.day_type === "typhoon_disaster_day" && "bg-sky-500/20 text-sky-400 font-black"
                                                                )}>
                                                                    {log.day_type === "typhoon_disaster_day" ? "🌀 Typhoon Work Day (2.0x)" : log.day_type.replace(/_/g, " ")}
                                                                </span>
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground flex gap-2 mt-0.5 font-medium">
                                                                <span>Total: {dayCalc.totalHours.toFixed(1)}h</span>
                                                                {dayCalc.overtimeHours > 0 && <span className="text-amber-500 font-bold">OT: {dayCalc.overtimeHours.toFixed(1)}h</span>}
                                                                {dayCalc.nightHours > 0 && <span className="text-indigo-400 font-bold">Night: {dayCalc.nightHours.toFixed(1)}h</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="text-right">
                                                            <span className="font-black tabular-nums text-emerald-500 block">
                                                                +{formatCurrency(dayCalc.totalPay, activeProfile.currency, showAmounts)}
                                                            </span>
                                                            {dayCalc.overtimePay > 0 && (
                                                                <span className="text-[9px] text-muted-foreground block font-bold">
                                                                    OT: {formatCurrency(dayCalc.overtimePay, activeProfile.currency, showAmounts)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => onDeleteTimeLog(log.id)}
                                                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
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
                        </div>
                    )}

                    {/* TAB 2: PAYROLL BREAKDOWN */}
                    {activeSubTab === "payroll" && activeProfile && payrollSummary && (
                        <div className="space-y-4">
                            {/* Monthly Selector */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-muted rounded-xl transition-all">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-black tracking-tight">
                                        {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })} Payroll
                                    </span>
                                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-muted rounded-xl transition-all">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <Button
                                    onClick={handleReceiveSalary}
                                    disabled={payrollSummary.netPay <= 0}
                                    className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-emerald-500/20"
                                    size="sm"
                                >
                                    <TrendingUp className="h-4 w-4" /> Deposit to Wallet
                                </Button>
                            </div>

                            {/* Detailed Breakdown Card */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                                    <div>
                                        <h3 className="text-base font-black tracking-tight">{activeProfile.label}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Rate: {formatCurrency(activeProfile.base_rate, activeProfile.currency)} / {activeProfile.rate_type} ({activeProfile.country === "TW" ? "Taiwan Labor Rules" : "PH DOLE Rules"})
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Net Payout</span>
                                        <span className="text-xl font-black text-emerald-500 tabular-nums">
                                            {formatCurrency(payrollSummary.netPay, activeProfile.currency, showAmounts)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                                    <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border/20">
                                        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">Earnings Breakdown</span>
                                        <div className="flex justify-between">
                                            <span>Regular Salary Pay ({payrollSummary.totalRegularHours.toFixed(1)}h):</span>
                                            <span className="font-bold tabular-nums">{formatCurrency(payrollSummary.totalRegularPay, activeProfile.currency, showAmounts)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-amber-500">Overtime Pay ({payrollSummary.totalOvertimeHours.toFixed(1)}h):</span>
                                            <span className="font-bold tabular-nums text-amber-500">+{formatCurrency(payrollSummary.totalOvertimePay, activeProfile.currency, showAmounts)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-indigo-400">Night Differential ({payrollSummary.totalNightHours.toFixed(1)}h):</span>
                                            <span className="font-bold tabular-nums text-indigo-400">+{formatCurrency(payrollSummary.totalNightPay, activeProfile.currency, showAmounts)}</span>
                                        </div>
                                        {payrollSummary.totalHolidayPremium > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-purple-500">Holiday Premiums:</span>
                                                <span className="font-bold tabular-nums text-purple-500">+{formatCurrency(payrollSummary.totalHolidayPremium, activeProfile.currency, showAmounts)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-border/30 pt-2 font-black text-sm">
                                            <span>Total Gross Earnings:</span>
                                            <span className="text-emerald-500 tabular-nums">{formatCurrency(payrollSummary.grossPay, activeProfile.currency, showAmounts)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border/20">
                                        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">Deductions & Benefits</span>
                                        <div className="flex justify-between">
                                            <span className="text-rose-500">
                                                {activeProfile.country === "TW" ? "Tax Withholding (18% flat):" : "Est. Tax Withholding:"}
                                            </span>
                                            <span className="font-bold tabular-nums text-rose-500">
                                                -{formatCurrency(payrollSummary.taxWithheld, activeProfile.currency, showAmounts)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-border/30 pt-2">
                                            <span>
                                                {activeProfile.country === "PH" ? "13th Month Accrued This Month:" : "Year-End Bonus Estimate:"}
                                            </span>
                                            <span className="font-bold tabular-nums text-sky-500">
                                                {formatCurrency(
                                                    activeProfile.country === "PH" ? payrollSummary.thirteenthMonthAccrued : payrollSummary.yearEndBonusEstimate,
                                                    activeProfile.currency,
                                                    showAmounts
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: TAX & REFUND ESTIMATOR */}
                    {activeSubTab === "tax" && activeProfile && taxEstimate && (
                        <div className="space-y-4">
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-5 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-amber-500" />
                                            <h3 className="text-base font-black tracking-tight">
                                                {activeProfile.country === "TW" ? "Taiwan August Tax Refund Estimator" : "Philippines Annual Tax Estimator"}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {activeProfile.country === "TW"
                                                ? "Foreign workers are withheld at 18%, but get refunded in August after 183 days of residency!"
                                                : "Calculate annual BIR tax liabilities, 13th month exemption & withholding balance."}
                                        </p>
                                    </div>

                                    {/* Taiwan Days in Country Counter */}
                                    {activeProfile.country === "TW" && (
                                        <div className="flex items-center gap-3 bg-muted/50 p-2.5 rounded-xl border border-border/30 text-xs">
                                            <span className="font-bold">Days in Taiwan:</span>
                                            <input
                                                type="number"
                                                value={daysInCountry}
                                                onChange={e => setDaysInCountry(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-16 px-2 py-1 bg-background border border-border/60 rounded-lg text-center font-bold text-xs focus:outline-none"
                                            />
                                            <span className={cn("px-2 py-0.5 rounded-md font-bold text-[10px]", daysInCountry >= 183 ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500")}>
                                                {daysInCountry >= 183 ? "Resident (5%)" : "Non-Resident (18%)"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Main Refund Highlight Banner */}
                                {activeProfile.country === "TW" ? (
                                    <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                                                🎉 Estimated August Tax Refund
                                            </span>
                                            <div className="text-3xl font-black text-emerald-500 tracking-tight tabular-nums">
                                                {formatCurrency(taxEstimate.estimatedRefund, activeProfile.currency, showAmounts)}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-medium">
                                                Based on 18% monthly withholding ({formatCurrency(taxEstimate.totalWithheld, activeProfile.currency, showAmounts)}) minus actual 5% resident tax ({formatCurrency(taxEstimate.actualTaxOwed, activeProfile.currency, showAmounts)}).
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0 bg-background/80 backdrop-blur-sm p-3.5 rounded-xl border border-border/40 space-y-1 text-xs">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-muted-foreground">Total Withheld (18%):</span>
                                                <span className="font-bold tabular-nums">{formatCurrency(taxEstimate.totalWithheld, activeProfile.currency, showAmounts)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-muted-foreground">Actual Tax Owed:</span>
                                                <span className="font-bold tabular-nums text-rose-500">{formatCurrency(taxEstimate.actualTaxOwed, activeProfile.currency, showAmounts)}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 border-t border-border/30 pt-1 font-black">
                                                <span>August Refund:</span>
                                                <span className="text-emerald-500 tabular-nums">{formatCurrency(taxEstimate.estimatedRefund, activeProfile.currency, showAmounts)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* PH Tax Banner */
                                    <div className="bg-muted/40 border border-border/30 rounded-2xl p-5 space-y-3">
                                        <h4 className="text-sm font-bold">Philippines BIR TRAIN Law Breakdown</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                            <div className="bg-background/80 p-3 rounded-xl border border-border/30">
                                                <span className="text-muted-foreground block font-medium">13th Month Pay</span>
                                                <span className="text-base font-black text-sky-500 tabular-nums">
                                                    {formatCurrency(taxEstimate.thirteenthMonth, activeProfile.currency, showAmounts)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground block mt-0.5">First ₱90,000 tax-exempt</span>
                                            </div>
                                            <div className="bg-background/80 p-3 rounded-xl border border-border/30">
                                                <span className="text-muted-foreground block font-medium">Taxable Income</span>
                                                <span className="text-base font-black text-amber-500 tabular-nums">
                                                    {formatCurrency(taxEstimate.taxableIncome, activeProfile.currency, showAmounts)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground block mt-0.5">After deductions & 13th mo exemption</span>
                                            </div>
                                            <div className="bg-background/80 p-3 rounded-xl border border-border/30">
                                                <span className="text-muted-foreground block font-medium">Annual BIR Tax Owed</span>
                                                <span className="text-base font-black text-rose-500 tabular-nums">
                                                    {formatCurrency(taxEstimate.actualTaxOwed, activeProfile.currency, showAmounts)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground block mt-0.5">Effective rate: {taxEstimate.effectiveRate.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: JOB PROFILES SETTINGS */}
                    {activeSubTab === "profiles" && (
                        <div className="space-y-4">
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex justify-between items-center">
                                <h3 className="text-sm font-bold">Work Profiles ({profiles.length})</h3>
                                <Button
                                    onClick={() => {
                                        setEditingProfile(null)
                                        handleQuickPreset("TW_2_2")
                                        setShowProfileModal(true)
                                    }}
                                    className="bg-primary text-primary-foreground font-bold rounded-xl text-xs gap-1.5"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" /> Add Profile
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profiles.map(p => (
                                    <div key={p.id} className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{p.country === "TW" ? "🇹🇼" : "🇵🇭"}</span>
                                                <div>
                                                    <h4 className="text-sm font-black">{p.label}</h4>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">{p.schedule_type} Schedule ({p.shift_hours}h shift)</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingProfile(p)
                                                        setProfileFormData({
                                                            label: p.label,
                                                            country: p.country,
                                                            schedule_type: p.schedule_type,
                                                            shift_hours: p.shift_hours,
                                                            rate_type: p.rate_type,
                                                            base_rate: p.base_rate,
                                                            currency: p.currency,
                                                            wallet_id: p.wallet_id || "",
                                                            cycle_start_date: p.cycle_start_date || new Date().toISOString().split("T")[0],
                                                            year_end_bonus_multiplier: p.year_end_bonus_multiplier || 1.0,
                                                        })
                                                        setShowProfileModal(true)
                                                    }}
                                                    className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-all"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteProfile(p.id)}
                                                    className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/20 pt-2 text-xs space-y-1 font-medium text-muted-foreground">
                                            <div className="flex justify-between">
                                                <span>Base Rate:</span>
                                                <span className="font-bold text-foreground">{formatCurrency(p.base_rate, p.currency)} / {p.rate_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Target Payout Wallet:</span>
                                                <span className="font-bold text-foreground">
                                                    {wallets.find(w => w.id === p.wallet_id)?.name || "Not selected"}
                                                </span>
                                            </div>
                                            {p.schedule_type === "2-2" && (
                                                <div className="flex justify-between">
                                                    <span>Cycle Start Date:</span>
                                                    <span className="font-bold text-foreground">{p.cycle_start_date || "Not set"}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Profile Modal */}
            <Modal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                title={editingProfile ? "Edit Job Profile" : "Create Work Profile"}
                className="max-w-md"
            >
                <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs font-medium">
                    {/* Quick Presets */}
                    {!editingProfile && (
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => handleQuickPreset("TW_2_2")}
                                className="flex-1 p-2 bg-muted/60 hover:bg-muted rounded-xl border border-border/30 font-bold text-center transition-all"
                            >
                                🇹🇼 Taiwan 2-2 Factory
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickPreset("PH_5_2")}
                                className="flex-1 p-2 bg-muted/60 hover:bg-muted rounded-xl border border-border/30 font-bold text-center transition-all"
                            >
                                🇵🇭 PH 5-2 Office
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Profile Name</label>
                        <input
                            type="text"
                            value={profileFormData.label}
                            onChange={e => setProfileFormData({ ...profileFormData, label: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Country Law</label>
                            <select
                                value={profileFormData.country}
                                onChange={e => setProfileFormData({ ...profileFormData, country: e.target.value as "TW" | "PH" })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                            >
                                <option value="TW">🇹🇼 Taiwan (勞動基準法)</option>
                                <option value="PH">🇵🇭 Philippines (DOLE)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Schedule</label>
                            <select
                                value={profileFormData.schedule_type}
                                onChange={e => setProfileFormData({ ...profileFormData, schedule_type: e.target.value as any })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                            >
                                <option value="2-2">2-2 Rotation (12hr)</option>
                                <option value="5-2">5-2 Mon-Fri (8hr)</option>
                                <option value="custom">Custom Schedule</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Rate Type</label>
                            <select
                                value={profileFormData.rate_type}
                                onChange={e => setProfileFormData({ ...profileFormData, rate_type: e.target.value as any })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Base Rate</label>
                            <input
                                type="number"
                                step="any"
                                value={profileFormData.base_rate}
                                onChange={e => setProfileFormData({ ...profileFormData, base_rate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Currency</label>
                            <select
                                value={profileFormData.currency}
                                onChange={e => setProfileFormData({ ...profileFormData, currency: e.target.value as CurrencyCode })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                            >
                                {Object.keys(CURRENCIES).map(code => (
                                    <option key={code} value={code}>{CURRENCIES[code as CurrencyCode].flag} {code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Target Payout Wallet</label>
                        <select
                            value={profileFormData.wallet_id}
                            onChange={e => setProfileFormData({ ...profileFormData, wallet_id: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                        >
                            <option value="">Select wallet...</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name} ({w.currency || "PHP"})</option>
                            ))}
                        </select>
                    </div>

                    {profileFormData.schedule_type === "2-2" && (
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">2-2 Cycle First Work Day</label>
                            <input
                                type="date"
                                value={profileFormData.cycle_start_date || ""}
                                onChange={e => setProfileFormData({ ...profileFormData, cycle_start_date: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 bg-muted font-bold rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold rounded-xl">
                            Save Profile
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Time Log Modal */}
            <Modal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
                title="Log Shift Time"
                className="max-w-md"
            >
                <form onSubmit={handleSaveLog} className="p-6 space-y-4 text-xs font-medium">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Date</label>
                        <input
                            type="date"
                            value={logFormData.date}
                            onChange={e => handleLogDateChange(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                            required
                        />
                    </div>

                    {/* Automatic Holiday Alert */}
                    {activeProfile && (() => {
                        const detectedHoliday = checkHoliday(logFormData.date, activeProfile.country)
                        if (detectedHoliday) {
                            return (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 shrink-0" />
                                    <div>
                                        <div className="font-black">🎉 Official National Holiday Detected!</div>
                                        <div className="text-[10px] text-rose-500/80">{detectedHoliday.name} ({detectedHoliday.type.replace("_", " ")})</div>
                                    </div>
                                </div>
                            )
                        }
                        return null
                    })()}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Time In</label>
                            <input
                                type="time"
                                value={logFormData.time_in}
                                onChange={e => setLogFormData({ ...logFormData, time_in: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Time Out</label>
                            <input
                                type="time"
                                value={logFormData.time_out}
                                onChange={e => setLogFormData({ ...logFormData, time_out: e.target.value })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Day Type</label>
                        <select
                            value={logFormData.day_type}
                            onChange={e => setLogFormData({ ...logFormData, day_type: e.target.value as DayType })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none"
                        >
                            <option value="regular">Regular Work Day</option>
                            <option value="rest_day">Rest Day (Day Off)</option>
                            <option value="regular_holiday">Regular / National Holiday</option>
                            <option value="special_holiday">Special Holiday</option>
                            <option value="typhoon_disaster_day">🌀 Typhoon / Disaster Work Day (Double Pay 2.0x)</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="button" onClick={() => setShowLogModal(false)} className="flex-1 bg-muted font-bold rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-primary text-primary-foreground font-bold rounded-xl">
                            Save Shift
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
