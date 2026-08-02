import { useState, useMemo, useEffect } from "react"
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
    ChevronRight,
    AlertTriangle,
    Grid,
    List,
    Copy,
    Sun,
    Moon,
    Zap,
    Check,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Printer,
    Lock,
    Gift
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"
import type { WorkProfile, TimeLog, Wallet, DayType, CurrencyCode, ScheduleType, PayrollDeduction, KinsenasPeriod } from "./types"
import { CURRENCIES, formatCurrency, getLocalDateString } from "./types"
import { getComputationConfig } from "./computationConfig"
import {
    getHourlyRate,
    getMonthlySalary,
    getDailyRate,
    getStandardMonthlyHours,
    calculateDayPay,
    calculatePayroll,
    getAutoDayType
} from "./salaryCalculator"
import { estimateTax } from "./taxCalculator"
import {
    checkHoliday,
    getHolidaysForCountry,
    getUpcomingHolidays
} from "./holidays"
import { convertCurrency, getRemittanceFxRate, saveRemittanceFxRate, type ExchangeRates } from "./currency"

/** Auto-compute shift time-in/time-out based on shift type and hours */
function getShiftTimes(type: "day" | "night", shiftHours: number): { timeIn: string; timeOut: string } {
    if (type === "night") {
        // Night shift starts at 20:00 for 12hr, 22:00 for 8hr, etc
        const startHour = shiftHours >= 12 ? 20 : 24 - shiftHours
        const endHour = (startHour + shiftHours) % 24
        return {
            timeIn: `${String(startHour % 24).padStart(2, "0")}:00`,
            timeOut: `${String(endHour).padStart(2, "0")}:00`
        }
    }
    // Day shift starts at 08:00
    const endHour = 8 + shiftHours
    return {
        timeIn: "08:00",
        timeOut: `${String(endHour % 24).padStart(2, "0")}:00`
    }
}

interface SalarySectionProps {
    profiles: WorkProfile[]
    timeLogs: TimeLog[]
    wallets: Wallet[]
    showAmounts: boolean
    baseCurrency: CurrencyCode
    rates?: ExchangeRates
    deductions?: PayrollDeduction[]
    onAddProfile: (profile: Omit<WorkProfile, "id" | "created_at">) => Promise<void>
    onUpdateProfile: (id: string, profile: Partial<WorkProfile>) => Promise<void>
    onDeleteProfile: (id: string) => Promise<void>
    onAddTimeLog: (log: Omit<TimeLog, "id" | "created_at">) => Promise<void>
    onDeleteTimeLog: (id: string) => Promise<void>
    onReceiveIncome: (params: { amount: number; description: string; wallet_id: string; currency: CurrencyCode }) => Promise<void>
}

type SubTab = "timesheet" | "payroll" | "tax" | "profiles" | "holidays"

export function SalarySection({
    profiles,
    timeLogs,
    wallets,
    showAmounts,
    rates,
    deductions = [],
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
    const [timesheetViewMode, setTimesheetViewMode] = useState<"list" | "calendar">("list")
    const [selectedHolidayCountry, setSelectedHolidayCountry] = useState<"TW" | "PH">(() => activeProfile?.country || "TW")

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
        schedule_type: "2-2" as ScheduleType,
        shift_hours: 12,
        rate_type: "hourly" as "hourly" | "monthly",
        base_rate: 183,
        custom_monthly_hours: undefined as number | undefined,
        custom_work_days: undefined as number | undefined,
        custom_rest_days: undefined as number | undefined,
        currency: "NTD" as CurrencyCode,
        wallet_id: "",
        cycle_start_date: getLocalDateString(),
        year_end_bonus_multiplier: 1.0,
    })

    // TimeLog Form State
    const [showLogModal, setShowLogModal] = useState(false)
    const [logFormData, setLogFormData] = useState({
        date: getLocalDateString(),
        time_in: "08:00",
        time_out: "20:00",
        break_minutes: 0,
        day_type: "regular" as DayType,
        notes: "",
    })

    // Auto-detect day_type & default break_minutes when showLogModal opens or date/profile changes
    useEffect(() => {
        if (showLogModal && activeProfile) {
            const autoType = getAutoDayType(logFormData.date, activeProfile)
            const defaultBreak = activeProfile.shift_hours === 12 ? 120 : (activeProfile.shift_hours === 8 ? 60 : 0)
            setLogFormData(prev => ({
                ...prev,
                day_type: autoType,
                break_minutes: prev.break_minutes === 0 ? defaultBreak : prev.break_minutes
            }))
        }
    }, [showLogModal, activeProfile])

    // Tax Estimator Inputs
    const [daysInCountry, setDaysInCountry] = useState<number>(365)
    const [manualAnnualGross] = useState<string>("")

    // Kinsenas Period State (full, kinsenas1, kinsenas2)
    const [kinsenasPeriod, setKinsenasPeriod] = useState<KinsenasPeriod>("full")
    const [showPrintablePayslip, setShowPrintablePayslip] = useState(false)

    // Remittance FX Rate Lock State
    const [remittanceFxRate, setRemittanceFxRateState] = useState<number>(() =>
        getRemittanceFxRate("NTD", "PHP", 1.80)
    )

    // Feedback notices
    const [incomeAddedNotice, setIncomeAddedNotice] = useState<string | null>(null)
    const [copiedPayslipNotice, setCopiedPayslipNotice] = useState(false)

    // Filter logs for selected profile & month
    const profileLogs = useMemo(() => {
        if (!activeProfile) return []
        return timeLogs.filter(l => l.profile_id === activeProfile.id)
    }, [timeLogs, activeProfile])

    const monthlyLogs = useMemo(() => {
        return profileLogs.filter(l => l.date.startsWith(selectedMonth))
    }, [profileLogs, selectedMonth])

    // Calculate monthly payroll summary (filtered by kinsenasPeriod)
    const payrollSummary = useMemo(() => {
        if (!activeProfile) return null
        return calculatePayroll(monthlyLogs, activeProfile, deductions, kinsenasPeriod)
    }, [monthlyLogs, activeProfile, deductions, kinsenasPeriod])

    // Calculate previous month payroll summary for monthly comparison
    const prevMonthPayrollSummary = useMemo(() => {
        if (!activeProfile) return null
        const [y, m] = selectedMonth.split("-").map(Number)
        const prevD = new Date(y, m - 2, 1)
        const prevMonthStr = `${prevD.getFullYear()}-${String(prevD.getMonth() + 1).padStart(2, "0")}`
        const prevLogs = profileLogs.filter(l => l.date.startsWith(prevMonthStr))
        if (prevLogs.length === 0) return null
        return calculatePayroll(prevLogs, activeProfile, deductions, kinsenasPeriod)
    }, [profileLogs, selectedMonth, activeProfile, deductions, kinsenasPeriod])

    // Calculate Year-To-Date (YTD) 13th Month / Annual Bonus Progress
    const ytdEarnings = useMemo(() => {
        if (!activeProfile) return { gross: 0, basic: 0, accrued13th: 0, target13th: 0, percent13th: 0 }
        const currentYear = selectedMonth.split("-")[0]
        const yearLogs = profileLogs.filter(l => l.date.startsWith(currentYear))
        
        let gross = 0
        let basic = 0
        for (const log of yearLogs) {
            const dayBreakdown = calculateDayPay(log, activeProfile)
            gross += dayBreakdown.totalPay
            basic += dayBreakdown.regularPay
        }

        const accrued13th = basic / 12
        const target13th = getMonthlySalary(activeProfile)
        const percent13th = target13th > 0 ? Math.min((accrued13th / target13th) * 100, 100) : 0

        return { gross, basic, accrued13th, target13th, percent13th }
    }, [profileLogs, activeProfile, selectedMonth])

    // Calculate annual tax estimate
    const taxEstimate = useMemo(() => {
        if (!activeProfile) return null
        const loggedGrossAnnual = profileLogs.reduce((acc, log) => {
            const dayBreakdown = calculateDayPay(log, activeProfile)
            return acc + dayBreakdown.totalPay
        }, 0)

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

    // Missing Shift Detector (computes expected work days vs logged days)
    const missingWorkDays = useMemo(() => {
        if (!activeProfile || monthlyLogs.length === 0) return []
        const [year, month] = selectedMonth.split("-").map(Number)
        const daysInMonthCount = new Date(year, month, 0).getDate()
        const todayStr = getLocalDateString()

        const missing: string[] = []
        const loggedDatesSet = new Set(monthlyLogs.map(l => l.date))

        for (let day = 1; day <= daysInMonthCount; day++) {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            // Only check days up to today or all days if past month
            if (dateStr > todayStr) continue

            if (!loggedDatesSet.has(dateStr)) {
                const autoType = getAutoDayType(dateStr, activeProfile)
                if (autoType === "regular") {
                    missing.push(dateStr)
                }
            }
        }
        return missing
    }, [activeProfile, monthlyLogs, selectedMonth])

    // Quick profile setup presets
    const handleQuickPreset = (preset: "TW_2_2" | "PH_5_2") => {
        if (preset === "TW_2_2") {
            setProfileFormData({
                label: "Taiwan Factory (2-2 Shift)",
                country: "TW",
                schedule_type: "2-2",
                shift_hours: 12,
                rate_type: "hourly",
                base_rate: 183,
                custom_monthly_hours: undefined,
                custom_work_days: undefined,
                custom_rest_days: undefined,
                currency: "NTD",
                wallet_id: wallets[0]?.id || "",
                cycle_start_date: getLocalDateString(),
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
                custom_monthly_hours: undefined,
                custom_work_days: undefined,
                custom_rest_days: undefined,
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
                date: getLocalDateString(),
                time_in: "08:00",
                time_out: "20:00",
                break_minutes: activeProfile?.shift_hours === 12 ? 120 : 0,
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

    // Quick 1-tap shift log helper
    const handleQuickShiftLog = async (type: "day" | "night", dateOverride?: string) => {
        if (!activeProfile) return
        const targetDate = dateOverride || getLocalDateString()
        const shiftHours = activeProfile.shift_hours || 12
        const { timeIn, timeOut } = getShiftTimes(type, shiftHours)

        const autoType = getAutoDayType(targetDate, activeProfile)
        try {
            await onAddTimeLog({
                profile_id: activeProfile.id,
                date: targetDate,
                time_in: timeIn,
                time_out: timeOut,
                day_type: autoType,
                notes: `Quick Logged (${type} shift)`
            })
        } catch (err) {
            console.error("Error in quick shift log:", err)
        }
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

    // Export Payslip Text Generator
    const handleExportPayslip = () => {
        if (!payrollSummary || !activeProfile) return
        const monthTitle = new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        const currency = activeProfile.currency
        const phpConverted = rates ? convertCurrency(payrollSummary.netPay, currency, "PHP", rates) : 0

        const payslipText = `
═══ PAYSLIP SUMMARY (${monthTitle}) ═══
Work Profile: ${activeProfile.label} (${activeProfile.country === "TW" ? "Taiwan 🇹🇼" : "Philippines 🇵🇭"})
Schedule: ${activeProfile.schedule_type} (${activeProfile.shift_hours}h shifts)

EARNINGS BREAKDOWN:
• Days Worked: ${payrollSummary.totalDaysWorked} days
• Regular Hours: ${payrollSummary.totalRegularHours.toFixed(1)}h ➔ ${formatCurrency(payrollSummary.totalRegularPay, currency)}
• Overtime Hours: ${payrollSummary.totalOvertimeHours.toFixed(1)}h ➔ ${formatCurrency(payrollSummary.totalOvertimePay, currency)}
• Night Differential: ${payrollSummary.totalNightHours.toFixed(1)}h ➔ ${formatCurrency(payrollSummary.totalNightPay, currency)}
${payrollSummary.totalHolidayPremium > 0 ? `• Holiday Premiums: ➔ ${formatCurrency(payrollSummary.totalHolidayPremium, currency)}\n` : ""}
──────────────────────────────────────
GROSS EARNINGS: ${formatCurrency(payrollSummary.grossPay, currency)}
DEDUCTIONS:
• Tax Withheld: -${formatCurrency(payrollSummary.taxWithheld, currency)}
${payrollSummary.deductionBreakdown.map(d => `• ${d.label}: -${formatCurrency(d.amount, currency)}`).join("\n")}
──────────────────────────────────────
NET PAYOUT: ${formatCurrency(payrollSummary.netPay, currency)}
${currency !== "PHP" && rates ? `\n≈ PHP Remittance Value: ₱${phpConverted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP` : ""}
`.trim()

        navigator.clipboard.writeText(payslipText)
        setCopiedPayslipNotice(true)
        setTimeout(() => setCopiedPayslipNotice(false), 3000)
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
            {/* Today's Statutory Holiday Banner if today is a holiday */}
            {(() => {
                const todayStr = getLocalDateString()
                const country = activeProfile ? activeProfile.country : "TW"
                const todayHoliday = checkHoliday(todayStr, country)
                if (!todayHoliday) return null

                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-primary/20 border border-rose-500/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-rose-500 shadow-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500 text-white rounded-xl font-black text-lg shrink-0">🎉</div>
                            <div>
                                <div className="text-xs font-black uppercase tracking-wider text-rose-500">TODAY IS AN OFFICIAL STATUTORY HOLIDAY!</div>
                                <div className="text-sm font-black text-foreground">{todayHoliday.name} ({country === "TW" ? "🇹🇼 Taiwan" : "🇵🇭 Philippines"})</div>
                                <div className="text-[11px] text-muted-foreground font-medium">Working today earns <span className="font-bold text-rose-500">{todayHoliday.type === "regular_holiday" ? "2.0x Double Pay" : "1.3x Special Holiday Pay"}</span>!</div>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                setLogFormData({
                                    date: todayStr,
                                    time_in: "08:00",
                                    time_out: activeProfile?.shift_hours === 12 ? "20:00" : "17:00",
                                    break_minutes: activeProfile?.shift_hours === 12 ? 120 : 0,
                                    day_type: todayHoliday.type,
                                    notes: `Holiday shift: ${todayHoliday.name}`
                                })
                                setShowLogModal(true)
                            }}
                            className="bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl text-xs shrink-0 gap-1.5 shadow-md shadow-rose-500/20"
                        >
                            <Sparkles className="h-4 w-4" /> + Log Holiday Shift Today
                        </Button>
                    </motion.div>
                )
            })()}

            {/* Header & Job Selector */}
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-black tracking-tight">Salary & Overtime Calculator</h2>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                            Track shifts, Taiwan 2-2 schedules, overtime, night differential, holidays & tax refunds.
                        </p>

                        {/* Upcoming Holiday Header Badge */}
                        {(() => {
                            const country = activeProfile ? activeProfile.country : "TW"
                            const upcoming = getUpcomingHolidays(country, 1)
                            if (upcoming.length === 0) return null
                            const nextH = upcoming[0]
                            return (
                                <button
                                    onClick={() => {
                                        setSelectedHolidayCountry(country)
                                        setActiveSubTab("holidays")
                                    }}
                                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-[11px] font-bold transition-all"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Next Holiday: <span className="font-black">{nextH.name}</span> ({new Date(nextH.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})</span>
                                    <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-md text-[9px] font-black">
                                        {nextH.daysAway === 0 ? "TODAY" : `in ${nextH.daysAway}d`}
                                    </span>
                                </button>
                            )
                        })()}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Profile selector dropdown */}
                        {profiles.length > 0 && (
                            <select
                                value={selectedProfileId}
                                onChange={e => {
                                    setSelectedProfileId(e.target.value)
                                    const prof = profiles.find(p => p.id === e.target.value)
                                    if (prof) setSelectedHolidayCountry(prof.country)
                                }}
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
                        { key: "holidays", label: "Official Holidays", icon: Sparkles },
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

            {!activeProfile && activeSubTab !== "profiles" && activeSubTab !== "holidays" ? (
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
                            {/* Month Selector Bar & View Toggle */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
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

                                <div className="flex items-center gap-2">
                                    {/* View Toggle */}
                                    <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border border-border/30">
                                        <button
                                            onClick={() => setTimesheetViewMode("list")}
                                            className={cn(
                                                "p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                                timesheetViewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                                            )}
                                        >
                                            <List className="h-3.5 w-3.5" /> List
                                        </button>
                                        <button
                                            onClick={() => setTimesheetViewMode("calendar")}
                                            className={cn(
                                                "p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                                timesheetViewMode === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                                            )}
                                        >
                                            <Grid className="h-3.5 w-3.5" /> Calendar
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
                            </div>

                            {/* Quick Shift Log Buttons (1-Tap Today Shift) */}
                            {(() => {
                                const dayTimes = getShiftTimes("day", activeProfile.shift_hours)
                                const nightTimes = getShiftTimes("night", activeProfile.shift_hours)
                                return (
                                    <div className="bg-card/40 border border-border/30 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span>Quick Log Today ({new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}):</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleQuickShiftLog("day")}
                                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs"
                                            >
                                                <Sun className="h-3.5 w-3.5" /> ☀️ Day Shift ({dayTimes.timeIn}-{dayTimes.timeOut})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickShiftLog("night")}
                                                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs"
                                            >
                                                <Moon className="h-3.5 w-3.5" /> 🌙 Night Shift ({nightTimes.timeIn}-{nightTimes.timeOut})
                                            </button>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Missing Shift Detector Alert */}
                            {missingWorkDays.length > 0 && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-amber-500 text-xs font-medium">
                                    <div className="flex items-center gap-2 font-bold text-amber-500">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>Missing Shift Logs Detected ({missingWorkDays.length} scheduled work day{missingWorkDays.length > 1 ? "s" : ""} not logged)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {missingWorkDays.slice(0, 6).map(dateStr => (
                                            <button
                                                key={dateStr}
                                                onClick={() => {
                                                    const autoType = getAutoDayType(dateStr, activeProfile)
                                                    setLogFormData({
                                                        date: dateStr,
                                                        time_in: "08:00",
                                                        time_out: activeProfile.shift_hours === 12 ? "20:00" : "17:00",
                                                        break_minutes: activeProfile.shift_hours === 12 ? 120 : 0,
                                                        day_type: autoType,
                                                        notes: ""
                                                    })
                                                    setShowLogModal(true)
                                                }}
                                                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 rounded-lg text-[10px] font-bold border border-amber-500/30 transition-all flex items-center gap-1"
                                            >
                                                + Log {new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </button>
                                        ))}
                                        {missingWorkDays.length > 6 && (
                                            <span className="text-[10px] self-center font-bold text-amber-500/80">+{missingWorkDays.length - 6} more...</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Monthly Quick Stats */}
                            {payrollSummary && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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

                            {/* TIMESHEET VIEW: LIST VS CALENDAR */}
                            {timesheetViewMode === "list" ? (
                                /* List View */
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
                                                const holidayMatch = checkHoliday(log.date, activeProfile.country)

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
                                                                <div className="flex flex-wrap items-center gap-1.5">
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

                                                                    {/* Official Holiday Badge if matched */}
                                                                    {holidayMatch && (
                                                                        <span className="text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                                            🎉 {holidayMatch.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground flex gap-2 mt-0.5 font-medium flex-wrap">
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
                            ) : (
                                /* Calendar Grid View */
                                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground flex-wrap gap-2">
                                        <span>Monthly Shift Calendar</span>
                                        <div className="flex items-center gap-3 text-[10px]">
                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Regular</span>
                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Rest/OT</span>
                                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Holiday</span>
                                        </div>
                                    </div>

                                    {/* 7-column calendar grid wrapper for mobile horizontal scrolling */}
                                    <div className="overflow-x-auto pb-2 scrollbar-none">
                                        <div className="grid grid-cols-7 gap-1 text-center min-w-[560px] md:min-w-full">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                                            <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase py-1">
                                                {d}
                                            </div>
                                        ))}

                                        {(() => {
                                            const [year, month] = selectedMonth.split("-").map(Number)
                                            const daysInMonth = new Date(year, month, 0).getDate()
                                            const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7 // Mon = 0

                                            const emptyCells = Array.from({ length: firstDayIndex })
                                            const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
                                            const loggedMap = new Map(monthlyLogs.map(l => [l.date, l]))

                                            return (
                                                <>
                                                    {emptyCells.map((_, i) => (
                                                        <div key={`empty-${i}`} className="h-16 bg-muted/10 rounded-xl border border-border/10"></div>
                                                    ))}
                                                    {monthDays.map(day => {
                                                        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                                                        const log = loggedMap.get(dateStr)
                                                        const holiday = checkHoliday(dateStr, activeProfile.country)
                                                        const expectedDayType = getAutoDayType(dateStr, activeProfile)
                                                        const expectedWork = expectedDayType === "regular"

                                                        return (
                                                            <div
                                                                key={dateStr}
                                                                onClick={() => {
                                                                    if (!log) {
                                                                        const autoType = getAutoDayType(dateStr, activeProfile)
                                                                        setLogFormData({
                                                                            date: dateStr,
                                                                            time_in: "08:00",
                                                                            time_out: activeProfile.shift_hours === 12 ? "20:00" : "17:00",
                                                                            break_minutes: activeProfile.shift_hours === 12 ? 120 : 0,
                                                                            day_type: autoType,
                                                                            notes: ""
                                                                        })
                                                                        setShowLogModal(true)
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "h-16 p-1 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer relative overflow-hidden",
                                                                    log
                                                                        ? log.day_type === "regular"
                                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                                            : log.day_type === "rest_day"
                                                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                                                                : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                                                                        : expectedWork
                                                                            ? "bg-muted/40 border-dashed border-muted-foreground/30 hover:border-primary/50"
                                                                            : "bg-card/40 border-border/20 hover:border-primary/30"
                                                                )}
                                                            >
                                                                <div className="flex justify-between items-center text-[10px] font-black">
                                                                    <span>{day}</span>
                                                                    {holiday && <span className="text-[9px]">🎉</span>}
                                                                </div>

                                                                {log ? (
                                                                    <div className="text-[9px] font-bold tracking-tighter truncate">
                                                                        <div>{log.time_in.slice(0, 5)}</div>
                                                                        <div className="text-foreground/80">+{formatCurrency(calculateDayPay(log, activeProfile).totalPay, activeProfile.currency, showAmounts)}</div>
                                                                    </div>
                                                                ) : expectedWork ? (
                                                                    <div className="text-[8px] text-muted-foreground font-bold uppercase text-center py-1">
                                                                        Work Day
                                                                    </div>
                                                                ) : !expectedWork && expectedDayType === "rest_day" ? (
                                                                    <div className="text-[8px] text-muted-foreground/50 font-bold uppercase text-center py-1">
                                                                        Rest
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        )
                                                    })}
                                                </>
                                            )
                                        })()}
                                    </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: PAYROLL BREAKDOWN */}
                    {activeSubTab === "payroll" && activeProfile && payrollSummary && (
                        <div className="space-y-4">
                            {/* Monthly & Kinsenas Period Selector */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button onClick={handlePrevMonth} className="p-1.5 hover:bg-muted rounded-xl transition-all">
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-black tracking-tight">
                                        {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                    <button onClick={handleNextMonth} className="p-1.5 hover:bg-muted rounded-xl transition-all">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>

                                    {/* Kinsenas Period Selector Toggle */}
                                    <div className="flex bg-muted/60 p-1 rounded-xl gap-1 ml-2">
                                        <button
                                            onClick={() => setKinsenasPeriod("full")}
                                            className={cn(
                                                "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all",
                                                kinsenasPeriod === "full" ? "bg-background text-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            Full Month
                                        </button>
                                        <button
                                            onClick={() => setKinsenasPeriod("kinsenas1")}
                                            className={cn(
                                                "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all",
                                                kinsenasPeriod === "kinsenas1" ? "bg-primary text-primary-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            1st Half (1–15th)
                                        </button>
                                        <button
                                            onClick={() => setKinsenasPeriod("kinsenas2")}
                                            className={cn(
                                                "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all",
                                                kinsenasPeriod === "kinsenas2" ? "bg-primary text-primary-foreground shadow-sm font-black" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            2nd Half (16–End)
                                        </button>
                                    </div>

                                    {/* Monthly Comparison Delta Badge */}
                                    {prevMonthPayrollSummary && (
                                        <div className={cn(
                                            "text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1",
                                            payrollSummary.grossPay >= prevMonthPayrollSummary.grossPay
                                                ? "bg-emerald-500/20 text-emerald-500"
                                                : "bg-rose-500/20 text-rose-500"
                                        )}>
                                            {payrollSummary.grossPay >= prevMonthPayrollSummary.grossPay ? (
                                                <ArrowUpRight className="h-3 w-3" />
                                            ) : (
                                                <ArrowDownRight className="h-3 w-3" />
                                            )}
                                            <span>
                                                {payrollSummary.grossPay >= prevMonthPayrollSummary.grossPay ? "+" : ""}
                                                {formatCurrency(payrollSummary.grossPay - prevMonthPayrollSummary.grossPay, activeProfile.currency, showAmounts)} vs Prev
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Printable Payslip Button */}
                                    <Button
                                        onClick={() => setShowPrintablePayslip(true)}
                                        variant="outline"
                                        className="font-bold rounded-xl text-xs gap-1.5"
                                        size="sm"
                                    >
                                        <Printer className="h-4 w-4 text-sky-500" />
                                        Printable Payslip
                                    </Button>

                                    {/* Export Copy Text Payslip Button */}
                                    <Button
                                        onClick={handleExportPayslip}
                                        variant="outline"
                                        className="font-bold rounded-xl text-xs gap-1.5"
                                        size="sm"
                                    >
                                        {copiedPayslipNotice ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        {copiedPayslipNotice ? "Copied!" : "Export Text"}
                                    </Button>

                                    <Button
                                        onClick={handleReceiveSalary}
                                        disabled={payrollSummary.netPay <= 0}
                                        className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-emerald-500/20"
                                        size="sm"
                                    >
                                        <TrendingUp className="h-4 w-4" /> Deposit to Wallet
                                    </Button>
                                </div>
                            </div>

                            {/* Detailed Breakdown Card */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                                    <div>
                                        <h3 className="text-base font-black tracking-tight">{activeProfile.label}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Rate: {formatCurrency(activeProfile.base_rate, activeProfile.currency)} / {activeProfile.rate_type} ({formatCurrency(getHourlyRate(activeProfile), activeProfile.currency)}/hr base)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Net Payout</span>
                                        <span className="text-xl font-black text-emerald-500 tabular-nums">
                                            {formatCurrency(payrollSummary.netPay, activeProfile.currency, showAmounts)}
                                        </span>
                                    </div>
                                </div>

                                {/* Remittance Conversion Card (e.g. NTD -> PHP) */}
                                {activeProfile.currency !== "PHP" && rates && (
                                    <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-sky-500" />
                                            <div>
                                                <span className="font-bold block">🇵🇭 Estimated Philippine Remittance Value</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    Rate: 1 {activeProfile.currency} ≈ {((rates.PHP || 58.5) / (rates[activeProfile.currency] || 1)).toFixed(2)} PHP
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right font-black text-sky-500 text-sm tabular-nums">
                                            ₱{convertCurrency(payrollSummary.netPay, activeProfile.currency, "PHP", rates).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                                        </div>
                                    </div>
                                )}

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
                                        {payrollSummary.deductionBreakdown.map((d, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="text-rose-400">{d.label}:</span>
                                                <span className="font-bold tabular-nums text-rose-400">
                                                    -{formatCurrency(d.amount, activeProfile.currency, showAmounts)}
                                                </span>
                                            </div>
                                        ))}
                                        {payrollSummary.totalDeductions > 0 && (
                                            <div className="flex justify-between border-t border-border/20 pt-1 font-bold text-xs">
                                                <span className="text-rose-500">Total All Deductions:</span>
                                                <span className="tabular-nums text-rose-500">
                                                    -{formatCurrency(payrollSummary.taxWithheld + payrollSummary.totalDeductions, activeProfile.currency, showAmounts)}
                                                </span>
                                            </div>
                                        )}
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

                                {/* 🎁 13TH MONTH PAY & ANNUAL BONUS PROGRESS TRACKER CARD */}
                                <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 space-y-3 shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Gift className="h-5 w-5 text-amber-500" />
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-tight">
                                                    {activeProfile.country === "PH" ? `${selectedMonth.split("-")[0]} YTD 13th-Month Pay Accrual` : `${selectedMonth.split("-")[0]} Year-End Bonus Projection`}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground font-semibold">
                                                    {activeProfile.country === "PH"
                                                        ? "Mandatory 13th-month pay accrued based on basic earnings (DOLE PD 851)"
                                                        : "Taiwan Year-End Bonus (年終獎金) estimated projection"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black tabular-nums text-amber-500">
                                            {formatCurrency(
                                                activeProfile.country === "PH" ? ytdEarnings.accrued13th : ytdEarnings.accrued13th * (activeProfile.year_end_bonus_multiplier || 1),
                                                activeProfile.currency,
                                                showAmounts
                                            )}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>Accrual Progress</span>
                                            <span>{Math.round(ytdEarnings.percent13th)}% of 1 Full Month Salary ({formatCurrency(ytdEarnings.target13th, activeProfile.currency, showAmounts)})</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ytdEarnings.percent13th}%` }}
                                                transition={{ duration: 0.8 }}
                                                className="h-full bg-amber-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 💱 REMITTANCE FX RATE LOCK CARD */}
                                {activeProfile.currency !== "PHP" && (
                                    <div className="bg-card/40 border border-border/20 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-sky-500" />
                                            <div>
                                                <span className="font-bold text-foreground">Remittance FX Rate Lock: </span>
                                                <span className="font-black text-sky-500">1 {activeProfile.currency} = ₱{remittanceFxRate.toFixed(2)} PHP</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={remittanceFxRate}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value) || 0
                                                    setRemittanceFxRateState(val)
                                                    saveRemittanceFxRate(val, activeProfile.currency, "PHP")
                                                }}
                                                className="w-20 px-2 py-1 bg-background border border-border/60 rounded-lg text-xs font-bold tabular-nums"
                                                placeholder="Rate ₱"
                                            />
                                            <span className="text-[10px] text-muted-foreground font-bold">≈ ₱{(payrollSummary.netPay * remittanceFxRate).toLocaleString("en-US", { minimumFractionDigits: 2 })} PHP payout</span>
                                        </div>
                                    </div>
                                )}
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

                    {/* TAB 4: OFFICIAL HOLIDAYS SUBTAB */}
                    {activeSubTab === "holidays" && (
                        <div className="space-y-4">
                            {/* Top Country Selector & Summary Header */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        <h3 className="text-base font-black tracking-tight">Official Statutory Holidays Calendar</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Check statutory double pay (2.0x) holidays, calculate potential earnings, and 1-click log shift.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedHolidayCountry("TW")}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                            selectedHolidayCountry === "TW" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        🇹🇼 Taiwan (16 Statutory Days)
                                    </button>
                                    <button
                                        onClick={() => setSelectedHolidayCountry("PH")}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                            selectedHolidayCountry === "PH" ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        🇵🇭 Philippines (19 Holidays)
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Holidays Countdown Banner */}
                            {(() => {
                                const upcoming = getUpcomingHolidays(selectedHolidayCountry, 2)
                                if (upcoming.length === 0) return null
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {upcoming.map(h => (
                                            <div key={h.date} className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-primary/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">
                                                        ⏳ Next Upcoming Holiday ({h.daysAway === 0 ? "Today!" : `in ${h.daysAway} days`})
                                                    </span>
                                                    <div className="text-sm font-black tracking-tight">{h.name}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">
                                                        {new Date(h.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setLogFormData({
                                                            date: h.date,
                                                            time_in: "08:00",
                                                            time_out: activeProfile?.shift_hours === 12 ? "20:00" : "17:00",
                                                            break_minutes: activeProfile?.shift_hours === 12 ? 120 : 0,
                                                            day_type: h.type,
                                                            notes: ""
                                                        })
                                                        setShowLogModal(true)
                                                    }}
                                                    className="bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl text-xs shrink-0"
                                                >
                                                    + Log Shift
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}

                            {/* Holidays List Card Grouped by Month */}
                            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-5 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    All 2026 {selectedHolidayCountry === "TW" ? "Taiwan (勞基法 §37)" : "Philippines (Proclamation 1006)"} Statutory Holidays
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getHolidaysForCountry(selectedHolidayCountry).map(h => {
                                        const hRate = activeProfile ? getHourlyRate(activeProfile) : (selectedHolidayCountry === "TW" ? 183 : 170.45)
                                        const shiftHrs = activeProfile?.shift_hours || (selectedHolidayCountry === "TW" ? 12 : 8)
                                        const currency = activeProfile?.currency || (selectedHolidayCountry === "TW" ? "NTD" : "PHP")
                                        const holidayMultiplier = h.type === "regular_holiday" ? 2.0 : 1.30
                                        const estimatedPay = hRate * shiftHrs * holidayMultiplier

                                        return (
                                            <div key={`${h.country}-${h.date}`} className="bg-background/80 border border-border/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg text-[10px]">
                                                            {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                            h.type === "regular_holiday" ? "bg-rose-500/20 text-rose-500" : "bg-purple-500/20 text-purple-400"
                                                        )}>
                                                            {h.type.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                    <div className="font-bold text-foreground truncate">{h.name}</div>
                                                    {/* Holiday Pay Preview */}
                                                    <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                                                        💰 Potential Pay ({shiftHrs}h shift): <span className="font-black tabular-nums">{formatCurrency(estimatedPay, currency, showAmounts)}</span> ({holidayMultiplier.toFixed(1)}x)
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setLogFormData({
                                                            date: h.date,
                                                            time_in: "08:00",
                                                            time_out: shiftHrs === 12 ? "20:00" : "17:00",
                                                            break_minutes: shiftHrs === 12 ? 120 : 0,
                                                            day_type: h.type,
                                                            notes: ""
                                                        })
                                                        setShowLogModal(true)
                                                    }}
                                                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl font-bold text-xs shrink-0 transition-all"
                                                >
                                                    + Log
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: JOB PROFILES SETTINGS */}
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
                                {profiles.map(p => {
                                    const hRate = getHourlyRate(p)
                                    const mSalary = getMonthlySalary(p)
                                    const stdHours = getStandardMonthlyHours(p)

                                    return (
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
                                                                custom_monthly_hours: p.custom_monthly_hours,
                                                                custom_work_days: p.custom_work_days,
                                                                custom_rest_days: p.custom_rest_days,
                                                                currency: p.currency,
                                                                wallet_id: p.wallet_id || "",
                                                                cycle_start_date: p.cycle_start_date || getLocalDateString(),
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

                                            {/* Comprehensive Rate Summary Card */}
                                            {(() => {
                                                const dRate = getDailyRate(p)
                                                const cfg = getComputationConfig()
                                                const isTW = p.country === "TW"
                                                const ot1Rate = hRate * (isTW ? cfg.tw.otTier1Multiplier : cfg.ph.otMultiplier)
                                                const ot2Rate = hRate * (isTW ? cfg.tw.otTier2Multiplier : cfg.ph.otMultiplier)
                                                const nightRate = isTW ? cfg.tw.nightDifferentialFlat : hRate * cfg.ph.nightDifferentialPercent
                                                const holidayMultiplier = isTW ? cfg.tw.holidayMultiplier : cfg.ph.holidayMultiplier

                                                return (
                                                    <div className="border-t border-border/20 pt-2 text-xs space-y-1.5 font-medium text-muted-foreground">
                                                        <div className="bg-muted/40 p-2.5 rounded-xl border border-border/20 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Monthly Salary</span>
                                                                <span className="font-black text-sky-500 tabular-nums">{formatCurrency(mSalary, p.currency)} / mo</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Hourly Base Rate</span>
                                                                <span className="font-black text-emerald-500 tabular-nums">{formatCurrency(hRate, p.currency)} / hr</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Daily Shift Rate</span>
                                                                <span className="font-black text-amber-500 tabular-nums">{formatCurrency(dRate, p.currency)} / day</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Holiday Rate ({holidayMultiplier}x)</span>
                                                                <span className="font-black text-rose-500 tabular-nums">{formatCurrency(hRate * holidayMultiplier * p.shift_hours, p.currency)} / day</span>
                                                            </div>
                                                        </div>

                                                        {/* OT & Night Rates */}
                                                        <div className="bg-muted/40 p-2.5 rounded-xl border border-border/20 grid grid-cols-3 gap-2 text-[11px]">
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                                                                    OT 1st 2hrs ({isTW ? `${cfg.tw.otTier1Multiplier}x` : `${cfg.ph.otMultiplier}x`})
                                                                </span>
                                                                <span className="font-black text-amber-500 tabular-nums">{formatCurrency(ot1Rate, p.currency)} / hr</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                                                                    OT Next ({isTW ? `${cfg.tw.otTier2Multiplier}x` : `${cfg.ph.otMultiplier}x`})
                                                                </span>
                                                                <span className="font-black text-amber-500 tabular-nums">{formatCurrency(ot2Rate, p.currency)} / hr</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                                                                    Night Diff ({isTW ? `NT$${cfg.tw.nightDifferentialFlat}/hr` : `${cfg.ph.nightDifferentialPercent * 100}%`})
                                                                </span>
                                                                <span className="font-black text-indigo-400 tabular-nums">+{formatCurrency(nightRate, p.currency)} / hr</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between pt-1">
                                                            <span>Standard Monthly Hours:</span>
                                                            <span className="font-bold text-foreground">{stdHours} hrs/month</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Schedule Type:</span>
                                                            <span className="font-bold text-foreground">{p.schedule_type} ({p.shift_hours}h shift)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Target Payout Wallet:</span>
                                                            <span className="font-bold text-foreground">
                                                                {wallets.find(w => w.id === p.wallet_id)?.name || "Not selected"}
                                                            </span>
                                                        </div>
                                                        {p.schedule_type !== "5-2" && (
                                                            <div className="flex justify-between">
                                                                <span>Cycle Start Date:</span>
                                                                <span className="font-bold text-foreground">{p.cycle_start_date || "Not set"}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )
                                })}
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
                    {!editingProfile && (
                        <div className="flex gap-2 pb-1">
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Country Law</label>
                            <select
                                value={profileFormData.country}
                                onChange={e => setProfileFormData({ ...profileFormData, country: e.target.value as "TW" | "PH" })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none text-xs"
                            >
                                <option value="TW">🇹🇼 Taiwan (勞基法)</option>
                                <option value="PH">🇵🇭 Philippines (DOLE)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Schedule</label>
                            <select
                                value={profileFormData.schedule_type}
                                onChange={e => {
                                    const sched = e.target.value as ScheduleType
                                    const autoHours = (sched === "2-2" || sched === "3-3") ? 12 : (sched === "4-3" ? 10 : 8)
                                    setProfileFormData(prev => ({
                                        ...prev,
                                        schedule_type: sched,
                                        shift_hours: autoHours
                                    }))
                                }}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none text-xs"
                            >
                                <option value="2-2">🇹🇼 2-2 Rotation (12hr)</option>
                                <option value="3-3">🇹🇼 3-3 Rotation (12hr)</option>
                                <option value="4-2">🇹🇼/🇵🇭 4-2 Rotation (8-12hr)</option>
                                <option value="4-3">🇹🇼/🇵🇭 4-3 Rotation (10-12hr)</option>
                                <option value="5-2">🇵🇭/🇹🇼 5-2 Mon-Fri (8hr)</option>
                                <option value="6-1">🇵🇭/🇹🇼 6-1 Schedule (8hr)</option>
                                <option value="3-shift">🇹🇼/🇵🇭 Rotating 3-Shift (8hr)</option>
                                <option value="custom">⚙️ Custom Work-Rest Cycle</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Shift Hours</label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                max="24"
                                value={profileFormData.shift_hours}
                                onChange={e => setProfileFormData({ ...profileFormData, shift_hours: parseFloat(e.target.value) || 8 })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none font-bold text-xs"
                                placeholder="e.g. 12"
                                required
                            />
                        </div>
                    </div>

                    {/* Custom Cycle Work & Rest Days if schedule is custom */}
                    {profileFormData.schedule_type === "custom" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/30">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Work Days in Cycle</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={profileFormData.custom_work_days || 4}
                                    onChange={e => setProfileFormData({ ...profileFormData, custom_work_days: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none font-bold text-xs"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Rest Days in Cycle</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={profileFormData.custom_rest_days || 2}
                                    onChange={e => setProfileFormData({ ...profileFormData, custom_rest_days: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none font-bold text-xs"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Rate Type</label>
                            <select
                                value={profileFormData.rate_type}
                                onChange={e => setProfileFormData({ ...profileFormData, rate_type: e.target.value as any })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none font-bold text-xs"
                            >
                                <option value="monthly">Monthly Salary</option>
                                <option value="hourly">Hourly Rate</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                {profileFormData.rate_type === "monthly" ? "Monthly Salary" : "Hourly Base Rate"}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={profileFormData.base_rate}
                                onChange={e => setProfileFormData({ ...profileFormData, base_rate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none font-bold text-xs"
                                placeholder={profileFormData.rate_type === "monthly" ? "e.g. 31707" : "e.g. 183"}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Currency</label>
                            <select
                                value={profileFormData.currency}
                                onChange={e => setProfileFormData({ ...profileFormData, currency: e.target.value as CurrencyCode })}
                                className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none font-bold text-xs"
                            >
                                {Object.keys(CURRENCIES).map(code => (
                                    <option key={code} value={code}>{CURRENCIES[code as CurrencyCode].flag} {code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Custom Standard Monthly Hours Optional Override */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                            Standard Monthly Working Hours (Optional Override)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={profileFormData.custom_monthly_hours || ""}
                            onChange={e => setProfileFormData({ ...profileFormData, custom_monthly_hours: e.target.value ? parseFloat(e.target.value) : undefined })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none text-xs"
                            placeholder={`Default: ${getStandardMonthlyHours(profileFormData as any)} hrs/mo (${profileFormData.country})`}
                        />
                    </div>

                    {/* Live Salary Computation Preview Card */}
                    {(() => {
                        const monthlyHours = getStandardMonthlyHours(profileFormData as any)
                        const computedHourly = getHourlyRate(profileFormData as any)
                        const computedMonthly = getMonthlySalary(profileFormData as any)
                        const computedDaily = getDailyRate(profileFormData as any)

                        const ot1Rate = computedHourly * (profileFormData.country === "TW" ? 1.34 : 1.25)
                        const ot2Rate = computedHourly * (profileFormData.country === "TW" ? 1.67 : 1.25)
                        const nightRate = profileFormData.country === "TW" ? 20 : computedHourly * 0.10
                        const holidayDailyPay = computedHourly * 2.0 * profileFormData.shift_hours

                        return (
                            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-2.5 text-xs">
                                <div className="flex justify-between items-center text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                                    <span className="flex items-center gap-1 text-primary">⚡ Auto-Calculated Base & Premium Rates</span>
                                    <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded-md">{monthlyHours} hrs/month</span>
                                </div>

                                {/* Primary Rates Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-border/20 pt-2">
                                    <div className="bg-background/80 p-2 rounded-lg border border-border/30">
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase block">Monthly Base</span>
                                        <span className="text-xs font-black text-sky-500 tabular-nums">
                                            {formatCurrency(computedMonthly, profileFormData.currency)}
                                        </span>
                                    </div>
                                    <div className="bg-background/80 p-2 rounded-lg border border-border/30">
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase block">Hourly Base</span>
                                        <span className="text-xs font-black text-emerald-500 tabular-nums">
                                            {formatCurrency(computedHourly, profileFormData.currency)}
                                        </span>
                                    </div>
                                    <div className="bg-background/80 p-2 rounded-lg border border-border/30">
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase block">Daily Shift ({profileFormData.shift_hours}h)</span>
                                        <span className="text-xs font-black text-amber-500 tabular-nums">
                                            {formatCurrency(computedDaily, profileFormData.currency)}
                                        </span>
                                    </div>
                                </div>

                                {/* Overtime & Night Premium Rates Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="bg-background/80 p-2 rounded-lg border border-border/30">
                                        <span className="text-[9px] text-amber-500 font-bold uppercase block">
                                            OT 1st 2h ({profileFormData.country === "TW" ? "1.34x" : "1.25x"})
                                        </span>
                                        <span className="text-[11px] font-black text-amber-500 tabular-nums">
                                            {formatCurrency(ot1Rate, profileFormData.currency)}/hr
                                        </span>
                                    </div>
                                    <div className="bg-background/80 p-2 rounded-lg border border-border/30">
                                        <span className="text-[9px] text-amber-500 font-bold uppercase block">
                                            OT Next ({profileFormData.country === "TW" ? "1.67x" : "1.25x"})
                                        </span>
                                        <span className="text-[11px] font-black text-amber-500 tabular-nums">
                                            {formatCurrency(ot2Rate, profileFormData.currency)}/hr
                                        </span>
                                    </div>
                                    <div className="bg-background/80 p-2 rounded-lg border border-border/30">
                                        <span className="text-[9px] text-indigo-400 font-bold uppercase block">
                                            Night Diff ({profileFormData.country === "TW" ? "NT$20/h" : "+10%"})
                                        </span>
                                        <span className="text-[11px] font-black text-indigo-400 tabular-nums">
                                            +{formatCurrency(nightRate, profileFormData.currency)}/hr
                                        </span>
                                    </div>
                                </div>

                                {/* Holiday Double Pay Card */}
                                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-rose-500 flex items-center gap-1">
                                        🎉 Double Pay Holiday Shift ({profileFormData.shift_hours}h shift):
                                    </span>
                                    <span className="font-black text-rose-500 tabular-nums">
                                        {formatCurrency(holidayDailyPay, profileFormData.currency)}
                                    </span>
                                </div>

                                <div className="text-[10px] text-muted-foreground font-medium pt-0.5 leading-relaxed">
                                    💡 <span className="font-bold text-foreground">Formula ({profileFormData.country === "TW" && profileFormData.rate_type === "monthly" ? "勞基法 §24 Statutory Standard" : "Standard Formula"}):</span> {formatCurrency(computedMonthly, profileFormData.currency)} ÷ {monthlyHours} hrs = <span className="font-bold text-emerald-500">{formatCurrency(computedHourly, profileFormData.currency)}/hr</span> base rate.
                                    {profileFormData.country === "TW" && profileFormData.rate_type === "monthly" && !profileFormData.custom_monthly_hours && (
                                        <span className="block text-[9.5px] text-sky-500 font-bold mt-0.5">
                                            🇹🇼 Taiwan Labor Law (勞基法 §24): Monthly salary uses statutory 240 hrs divisor (30 days × 8h). Type 173.2 above if your factory contract specifies 173.2 hrs!
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })()}

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

                    {profileFormData.schedule_type !== "5-2" && (
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Cycle Anchor Date (First Work Day)</label>
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
                    {/* ⚡ Quick Shift Presets Bar */}
                    {(() => {
                        const autoType = activeProfile ? getAutoDayType(logFormData.date, activeProfile) : "regular"
                        return (
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Quick Shift Presets</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setLogFormData({
                                            ...logFormData,
                                            time_in: "08:00",
                                            time_out: "20:00",
                                            break_minutes: 120,
                                            day_type: autoType
                                        })}
                                        className="px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                    >
                                        ☀️ Day (12h)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogFormData({
                                            ...logFormData,
                                            time_in: "20:00",
                                            time_out: "08:00",
                                            break_minutes: 120,
                                            day_type: autoType
                                        })}
                                        className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                    >
                                        🌙 Night (12h)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogFormData({
                                            ...logFormData,
                                            time_in: "08:00",
                                            time_out: "17:00",
                                            break_minutes: 60,
                                            day_type: autoType
                                        })}
                                        className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                    >
                                        👔 Regular 8h
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogFormData({
                                            ...logFormData,
                                            day_type: "rest_day"
                                        })}
                                        className="px-2 py-1.5 bg-muted/60 hover:bg-muted border border-border/40 text-muted-foreground rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                    >
                                        🏖️ Rest Day
                                    </button>
                                </div>
                            </div>
                        )
                    })()}

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

                    {/* Unpaid Break Time (Minutes) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unpaid Break / Meal Time</label>
                            <span className="text-[10px] font-bold text-primary">
                                {logFormData.break_minutes ? `${logFormData.break_minutes} mins (${(logFormData.break_minutes / 60).toFixed(1)}h)` : "No break"}
                            </span>
                        </div>
                        <div className="flex gap-1.5 mb-1.5">
                            {[0, 30, 60, 120].map(mins => (
                                <button
                                    type="button"
                                    key={mins}
                                    onClick={() => setLogFormData({ ...logFormData, break_minutes: mins })}
                                    className={cn(
                                        "flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all",
                                        logFormData.break_minutes === mins
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-muted/50 border-border/30 text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {mins === 0 ? "None" : mins === 60 ? "1h Break" : mins === 120 ? "2h Break (Taiwan Default)" : `${mins}m`}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            min="0"
                            max="480"
                            step="15"
                            value={logFormData.break_minutes || 0}
                            onChange={e => setLogFormData({ ...logFormData, break_minutes: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full px-3 py-1.5 bg-background border border-border/60 rounded-xl focus:outline-none text-xs font-bold"
                            placeholder="e.g. 120 mins for 2hr meal breaks"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Day Type</label>
                        <select
                            value={logFormData.day_type}
                            onChange={e => setLogFormData({ ...logFormData, day_type: e.target.value as DayType })}
                            className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl focus:outline-none text-xs font-bold"
                        >
                            <option value="regular">💼 Regular Work Day (正常工作日)</option>
                            <option value="rest_day">🏖️ Flexible Rest Day (休息日 - OT Rate 1.34x / 1.67x)</option>
                            <option value="mandatory_off">⛔ Mandatory Statutory Off (例休日 - Double Pay 2.0x)</option>
                            <option value="regular_holiday">🎉 Statutory National Holiday (國定假日 - Double Pay 2.0x)</option>
                            <option value="special_holiday">⭐ Special Holiday / Special Off (特別休假 / 特休 - 1.3x / 2.0x)</option>
                            <option value="rest_day_holiday">🎌 Holiday on Rest Day (休息日遇國定假日 - 2.6x Rate)</option>
                            <option value="typhoon_disaster_day">🌀 Typhoon / Disaster Work Day (颱風 / 天災出勤 - Double Pay 2.0x)</option>
                            <option value="paid_leave">🌴 Paid Annual / Vacation Leave (特休 / SIL - 100% Paid)</option>
                            <option value="sick_leave">🤒 Sick / Medical Leave (病假 - Paid / Half-Pay 50%)</option>
                            <option value="unpaid_leave">❌ Unpaid Personal Leave (事假 - 0 Pay)</option>
                        </select>
                    </div>

                    {/* 💰 Live Shift Earnings Calculator Card */}
                    {activeProfile && (() => {
                        const tempLog: TimeLog = {
                            id: "temp",
                            profile_id: activeProfile.id,
                            date: logFormData.date,
                            time_in: logFormData.time_in,
                            time_out: logFormData.time_out,
                            break_minutes: logFormData.break_minutes || 0,
                            day_type: logFormData.day_type,
                            notes: null,
                            created_at: new Date().toISOString()
                        }
                        const shiftCalc = calculateDayPay(tempLog, activeProfile)
                        if (!shiftCalc) return null

                        return (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-black text-emerald-500">
                                    <span className="flex items-center gap-1.5">
                                        <Calculator className="h-4 w-4 shrink-0" />
                                        <span>Estimated Shift Pay</span>
                                    </span>
                                    <span className="text-sm font-black tabular-nums">
                                        +{formatCurrency(shiftCalc.totalPay, activeProfile.currency, showAmounts)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                                    <span>Net Worked: <strong className="text-foreground">{shiftCalc.totalHours.toFixed(1)}h</strong> (Unpaid Break: {(logFormData.break_minutes / 60).toFixed(1)}h)</span>
                                    {shiftCalc.overtimeHours > 0 ? (
                                        <span className="text-amber-500 font-bold">Includes {shiftCalc.overtimeHours.toFixed(1)}h OT (+{formatCurrency(shiftCalc.overtimePay, activeProfile.currency, showAmounts)})</span>
                                    ) : (
                                        <span className="text-emerald-500/80 font-bold">Regular 8.0h Shift (0h OT)</span>
                                    )}
                                </div>
                                {shiftCalc.overtimeHours > 0 && (
                                    <div className="text-[9px] text-amber-500/90 font-medium pt-1 border-t border-emerald-500/10 flex justify-between">
                                        <span>Regular: {shiftCalc.regularHours.toFixed(1)}h @ 1.0x</span>
                                        <span>Overtime: {shiftCalc.overtimeHours.toFixed(1)}h @ {activeProfile.country === "TW" ? "1.34x / 1.67x (勞基法 §24)" : "1.25x / 1.30x"}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

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

            {/* 📄 PRINTABLE PAYSLIP MODAL */}
            <Modal
                isOpen={showPrintablePayslip}
                onClose={() => setShowPrintablePayslip(false)}
                title={`📄 Payslip — ${new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
                className="max-w-2xl"
            >
                {activeProfile && payrollSummary && (
                    <div className="p-6 space-y-6">
                        {/* Printable Area */}
                        <div id="printable-payslip" className="bg-background border border-border/40 rounded-2xl p-6 space-y-5 text-foreground">
                            {/* Header */}
                            <div className="flex justify-between items-start border-b border-border/30 pb-4">
                                <div>
                                    <h2 className="text-lg font-black tracking-tight uppercase">PAYSLIP SUMMARY</h2>
                                    <p className="text-xs font-bold text-muted-foreground">{activeProfile.label} ({activeProfile.country === "TW" ? "Taiwan 🇹🇼" : "Philippines 🇵🇭"})</p>
                                    <p className="text-[10px] text-muted-foreground">Schedule: {activeProfile.schedule_type} ({activeProfile.shift_hours}h shift)</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-primary/10 text-primary uppercase">
                                        {kinsenasPeriod === "full" ? "Full Month" : kinsenasPeriod === "kinsenas1" ? "1st Kinsenas (1–15th)" : "2nd Kinsenas (16–End)"}
                                    </span>
                                    <p className="text-xs font-bold text-muted-foreground mt-1">
                                        {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Earnings Table */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-500">Earnings</h3>
                                <table className="w-full text-xs font-medium border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/20 text-[10px] uppercase text-muted-foreground text-left">
                                            <th className="py-1">Description</th>
                                            <th className="py-1 text-center">Hours / Days</th>
                                            <th className="py-1 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10">
                                        <tr>
                                            <td className="py-1.5 font-bold">Days Worked</td>
                                            <td className="py-1.5 text-center">{payrollSummary.totalDaysWorked} days</td>
                                            <td className="py-1.5 text-right font-bold">—</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1.5">Regular Salary Pay</td>
                                            <td className="py-1.5 text-center">{payrollSummary.totalRegularHours.toFixed(1)} hrs</td>
                                            <td className="py-1.5 text-right font-bold tabular-nums">{formatCurrency(payrollSummary.totalRegularPay, activeProfile.currency, showAmounts)}</td>
                                        </tr>
                                        {payrollSummary.totalOvertimeHours > 0 && (
                                            <tr>
                                                <td className="py-1.5 text-amber-500 font-bold">Overtime Pay</td>
                                                <td className="py-1.5 text-center">{payrollSummary.totalOvertimeHours.toFixed(1)} hrs</td>
                                                <td className="py-1.5 text-right font-bold tabular-nums text-amber-500">+{formatCurrency(payrollSummary.totalOvertimePay, activeProfile.currency, showAmounts)}</td>
                                            </tr>
                                        )}
                                        {payrollSummary.totalNightHours > 0 && (
                                            <tr>
                                                <td className="py-1.5 text-indigo-400 font-bold">Night Differential Pay</td>
                                                <td className="py-1.5 text-center">{payrollSummary.totalNightHours.toFixed(1)} hrs</td>
                                                <td className="py-1.5 text-right font-bold tabular-nums text-indigo-400">+{formatCurrency(payrollSummary.totalNightPay, activeProfile.currency, showAmounts)}</td>
                                            </tr>
                                        )}
                                        {payrollSummary.totalHolidayPremium > 0 && (
                                            <tr>
                                                <td className="py-1.5 text-purple-500 font-bold">Holiday Premiums</td>
                                                <td className="py-1.5 text-center">—</td>
                                                <td className="py-1.5 text-right font-bold tabular-nums text-purple-500">+{formatCurrency(payrollSummary.totalHolidayPremium, activeProfile.currency, showAmounts)}</td>
                                            </tr>
                                        )}
                                        <tr className="border-t border-border/30 font-black text-sm">
                                            <td className="py-2">TOTAL GROSS EARNINGS</td>
                                            <td className="py-2"></td>
                                            <td className="py-2 text-right text-emerald-500 tabular-nums">{formatCurrency(payrollSummary.grossPay, activeProfile.currency, showAmounts)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Deductions Table */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Deductions</h3>
                                <table className="w-full text-xs font-medium border-collapse">
                                    <tbody className="divide-y divide-border/10">
                                        <tr>
                                            <td className="py-1.5 text-rose-500">Tax Withholding</td>
                                            <td className="py-1.5 text-right font-bold tabular-nums text-rose-500">-{formatCurrency(payrollSummary.taxWithheld, activeProfile.currency, showAmounts)}</td>
                                        </tr>
                                        {payrollSummary.deductionBreakdown.map((d, i) => (
                                            <tr key={i}>
                                                <td className="py-1.5 text-rose-400">{d.label}</td>
                                                <td className="py-1.5 text-right font-bold tabular-nums text-rose-400">-{formatCurrency(d.amount, activeProfile.currency, showAmounts)}</td>
                                            </tr>
                                        ))}
                                        <tr className="border-t border-border/30 font-black text-xs text-rose-500">
                                            <td className="py-2">TOTAL DEDUCTIONS</td>
                                            <td className="py-2 text-right tabular-nums">-{formatCurrency(payrollSummary.taxWithheld + payrollSummary.totalDeductions, activeProfile.currency, showAmounts)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Net Payout Callout */}
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Net Pay Payout</span>
                                    <span className="text-xl font-black tabular-nums text-primary tracking-tight">{formatCurrency(payrollSummary.netPay, activeProfile.currency, showAmounts)}</span>
                                </div>
                                {activeProfile.currency !== "PHP" && (
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-muted-foreground block">Remittance Value (Locked FX ₱{remittanceFxRate.toFixed(2)})</span>
                                        <span className="text-sm font-black tabular-nums text-sky-500">≈ ₱{(payrollSummary.netPay * remittanceFxRate).toLocaleString("en-US", { minimumFractionDigits: 2 })} PHP</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowPrintablePayslip(false)}
                                className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => window.print()}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg gap-2"
                            >
                                <Printer className="h-4 w-4" /> Print / Save PDF
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
