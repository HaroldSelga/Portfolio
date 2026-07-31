/**
 * Salary Calculator — Overtime & Pay Calculation Engine
 * Supports Taiwan (勞動基準法) and Philippines (DOLE) labor laws
 */

import type { WorkProfile, TimeLog, DayPayBreakdown, PayrollSummary, DayType } from "./types"

// ═══════════════════════════════════════════
// HELPER: Calculate hours worked from time-in/out
// ═══════════════════════════════════════════

function parseTime(t: string): { hours: number; minutes: number } {
    const [h, m] = t.split(":").map(Number)
    return { hours: h || 0, minutes: m || 0 }
}

function toMinutes(t: string): number {
    const { hours, minutes } = parseTime(t)
    return hours * 60 + minutes
}

export function calculateTotalHours(timeIn: string, timeOut: string): number {
    let inMin = toMinutes(timeIn)
    let outMin = toMinutes(timeOut)
    // Handle overnight shifts (e.g., 22:00 → 06:00)
    if (outMin <= inMin) outMin += 24 * 60
    return (outMin - inMin) / 60
}

// ═══════════════════════════════════════════
// HELPER: Calculate night hours (10PM–6AM)
// ═══════════════════════════════════════════

export function calculateNightHours(timeIn: string, timeOut: string): number {
    let inMin = toMinutes(timeIn)
    let outMin = toMinutes(timeOut)
    if (outMin <= inMin) outMin += 24 * 60

    let nightMinutes = 0
    // Night window: 22:00 (1320min) to 30:00 (06:00 next day = 1800min)
    // Also check 0:00-6:00 (0-360min)
    for (let m = inMin; m < outMin; m++) {
        const normalizedMin = m % (24 * 60)
        // 10PM (22:00) = 1320, 6AM (06:00) = 360
        if (normalizedMin >= 1320 || normalizedMin < 360) {
            nightMinutes++
        }
    }
    return nightMinutes / 60
}

export function getStandardMonthlyHours(profile: WorkProfile): number {
    if (profile.custom_monthly_hours && profile.custom_monthly_hours > 0) {
        return profile.custom_monthly_hours
    }
    // Default standard monthly working hours:
    // TW: 40hrs/week × 4.33 weeks = 173.2 hrs/month
    // PH: 8hrs/day × 22 working days = 176 hrs/month
    return profile.country === "TW" ? 173.2 : 176
}

export function getHourlyRate(profile: WorkProfile): number {
    if (profile.rate_type === "hourly") return profile.base_rate
    const monthlyHours = getStandardMonthlyHours(profile)
    return profile.base_rate > 0 ? profile.base_rate / monthlyHours : 0
}

export function getMonthlySalary(profile: WorkProfile): number {
    if (profile.rate_type === "monthly") return profile.base_rate
    const monthlyHours = getStandardMonthlyHours(profile)
    return profile.base_rate * monthlyHours
}

export function getDailyRate(profile: WorkProfile): number {
    const hourly = getHourlyRate(profile)
    const shiftHours = profile.shift_hours || 8
    return hourly * shiftHours
}

// ═══════════════════════════════════════════
// TAIWAN: Calculate pay for a single day
// ═══════════════════════════════════════════

function calculateDayPayTW(
    totalHours: number,
    nightHours: number,
    dayType: DayType,
    hourlyRate: number
): { regularPay: number; overtimePay: number; nightPay: number; holidayPremium: number; regularHours: number; overtimeHours: number } {
    const REGULAR_HOURS = 8
    let regularPay = 0
    let overtimePay = 0
    let nightPay = 0
    let holidayPremium = 0
    let regularHours = 0
    let overtimeHours = 0

    switch (dayType) {
        case "regular": {
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate

            // TW OT: first 2 hours = 1.34x, next 2 hours = 1.67x
            const ot1 = Math.min(overtimeHours, 2)
            const ot2 = Math.max(overtimeHours - 2, 0)
            overtimePay = (ot1 * hourlyRate * 1.34) + (ot2 * hourlyRate * 1.67)
            break
        }
        case "rest_day": {
            // Rest day: first 8 hours at 1.34x, next 2 at 1.67x, beyond 10 at 2.67x
            const rd1 = Math.min(totalHours, 8)
            const rd2 = Math.min(Math.max(totalHours - 8, 0), 2)
            const rd3 = Math.max(totalHours - 10, 0)

            regularHours = rd1
            overtimeHours = totalHours - rd1

            regularPay = rd1 * hourlyRate * 1.34
            overtimePay = (rd2 * hourlyRate * 1.67) + (rd3 * hourlyRate * 2.67)
            break
        }
        case "regular_holiday": {
            // National holiday: 2x for all hours
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate
            holidayPremium = regularHours * hourlyRate // extra 1x (total = 2x)

            const hotOt1 = Math.min(overtimeHours, 2)
            const hotOt2 = Math.max(overtimeHours - 2, 0)
            overtimePay = (hotOt1 * hourlyRate * 1.34) + (hotOt2 * hourlyRate * 1.67)
            overtimePay += overtimeHours * hourlyRate // holiday base for OT hours
            break
        }
        case "special_holiday": {
            // Special holiday (TW doesn't distinguish as much, treat similar to rest day)
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate * 1.34
            const shOt1 = Math.min(overtimeHours, 2)
            const shOt2 = Math.max(overtimeHours - 2, 0)
            overtimePay = (shOt1 * hourlyRate * 1.67) + (shOt2 * hourlyRate * 2.67)
            break
        }
        case "typhoon_disaster_day": {
            // Typhoon / Natural Disaster Day (颱風假 / 天然災害出勤):
            // Under Taiwan labor guidance, employees required to work on declared typhoon days get 2.0x double pay
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate
            holidayPremium = regularHours * hourlyRate // Extra 1.0x (Total 2.0x Double Pay)

            const typhOt1 = Math.min(overtimeHours, 2)
            const typhOt2 = Math.max(overtimeHours - 2, 0)
            overtimePay = (typhOt1 * hourlyRate * 1.67) + (typhOt2 * hourlyRate * 2.67)
            break
        }
    }

    // Night differential: +NT$20/hr for TW
    nightPay = nightHours * 20

    return { regularPay, overtimePay, nightPay, holidayPremium, regularHours, overtimeHours }
}

// ═══════════════════════════════════════════
// PHILIPPINES: Calculate pay for a single day
// ═══════════════════════════════════════════

function calculateDayPayPH(
    totalHours: number,
    nightHours: number,
    dayType: DayType,
    hourlyRate: number
): { regularPay: number; overtimePay: number; nightPay: number; holidayPremium: number; regularHours: number; overtimeHours: number } {
    const REGULAR_HOURS = 8
    let regularPay = 0
    let overtimePay = 0
    let nightPay = 0
    let holidayPremium = 0
    let regularHours = 0
    let overtimeHours = 0

    switch (dayType) {
        case "regular": {
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate
            overtimePay = overtimeHours * hourlyRate * 1.25
            break
        }
        case "rest_day": {
            // Rest day: 1.30x base, OT = 1.30 × 1.25 = 1.625 (rounded to 1.69 per DOLE)
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate * 1.30
            overtimePay = overtimeHours * hourlyRate * 1.69
            break
        }
        case "regular_holiday": {
            // Regular holiday: 2.0x base, OT = 2.0 × 1.30 = 2.60
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate
            holidayPremium = regularHours * hourlyRate // extra 1x (total 2x)
            overtimePay = overtimeHours * hourlyRate * 2.60
            break
        }
        case "special_holiday": {
            // Special holiday: 1.30x base, OT = 1.30 × 1.30 = 1.69
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate * 1.30
            overtimePay = overtimeHours * hourlyRate * 1.69
            break
        }
        case "typhoon_disaster_day": {
            // Disaster / Typhoon Work Day (DOLE Work Suspension): 2.0x double pay
            regularHours = Math.min(totalHours, REGULAR_HOURS)
            overtimeHours = Math.max(totalHours - REGULAR_HOURS, 0)

            regularPay = regularHours * hourlyRate
            holidayPremium = regularHours * hourlyRate // Extra 1.0x (Total 2.0x Double Pay)
            overtimePay = overtimeHours * hourlyRate * 2.60
            break
        }
    }

    // Night differential: +10% of hourly rate
    nightPay = nightHours * hourlyRate * 0.10

    return { regularPay, overtimePay, nightPay, holidayPremium, regularHours, overtimeHours }
}

// ═══════════════════════════════════════════
// PUBLIC: Calculate a single day's pay
// ═══════════════════════════════════════════

export function calculateDayPay(log: TimeLog, profile: WorkProfile): DayPayBreakdown {
    const totalHours = calculateTotalHours(log.time_in, log.time_out)
    const nightHours = calculateNightHours(log.time_in, log.time_out)
    const hourlyRate = getHourlyRate(profile)

    const calc = profile.country === "TW"
        ? calculateDayPayTW(totalHours, nightHours, log.day_type, hourlyRate)
        : calculateDayPayPH(totalHours, nightHours, log.day_type, hourlyRate)

    const totalPay = calc.regularPay + calc.overtimePay + calc.nightPay + calc.holidayPremium

    return {
        date: log.date,
        dayType: log.day_type,
        timeIn: log.time_in,
        timeOut: log.time_out,
        totalHours,
        regularHours: calc.regularHours,
        overtimeHours: calc.overtimeHours,
        nightHours,
        regularPay: calc.regularPay,
        overtimePay: calc.overtimePay,
        nightPay: calc.nightPay,
        holidayPremium: calc.holidayPremium,
        totalPay,
    }
}

// ═══════════════════════════════════════════
// PUBLIC: Calculate payroll summary for a set of logs
// ═══════════════════════════════════════════

export function calculatePayroll(logs: TimeLog[], profile: WorkProfile): PayrollSummary {
    const days = logs.map(log => calculateDayPay(log, profile))

    const totalRegularHours = days.reduce((s, d) => s + d.regularHours, 0)
    const totalOvertimeHours = days.reduce((s, d) => s + d.overtimeHours, 0)
    const totalNightHours = days.reduce((s, d) => s + d.nightHours, 0)
    const totalRegularPay = days.reduce((s, d) => s + d.regularPay, 0)
    const totalOvertimePay = days.reduce((s, d) => s + d.overtimePay, 0)
    const totalNightPay = days.reduce((s, d) => s + d.nightPay, 0)
    const totalHolidayPremium = days.reduce((s, d) => s + d.holidayPremium, 0)
    const grossPay = totalRegularPay + totalOvertimePay + totalNightPay + totalHolidayPremium

    // Tax withholding estimate
    const hourlyRate = getHourlyRate(profile)
    let taxWithheld = 0
    if (profile.country === "TW") {
        // Taiwan: 18% flat withholding for foreign workers (non-resident default)
        taxWithheld = grossPay * 0.18
    } else {
        // PH: rough monthly withholding estimate based on annualized income
        const annualized = grossPay * 12
        taxWithheld = calculatePHTaxMonthly(annualized) / 12
    }

    // 13th month pay accrued (PH: basic salary only, no OT/holiday/night)
    // TW: year-end bonus estimate
    let thirteenthMonthAccrued = 0
    let yearEndBonusEstimate = 0

    if (profile.country === "PH") {
        // Only basic salary (regular pay, excluding OT, night, holiday)
        thirteenthMonthAccrued = totalRegularPay / 12
    } else {
        // Taiwan year-end bonus: monthly base × multiplier
        const monthlyBase = profile.rate_type === "monthly"
            ? profile.base_rate
            : hourlyRate * 8 * 22 // approximate monthly for hourly workers
        yearEndBonusEstimate = monthlyBase * (profile.year_end_bonus_multiplier || 1)
    }

    return {
        totalDaysWorked: days.length,
        totalRegularHours,
        totalOvertimeHours,
        totalNightHours,
        totalRegularPay,
        totalOvertimePay,
        totalNightPay,
        totalHolidayPremium,
        grossPay,
        taxWithheld,
        netPay: grossPay - taxWithheld,
        thirteenthMonthAccrued,
        yearEndBonusEstimate,
        days,
    }
}

// ═══════════════════════════════════════════
// HELPER: PH monthly tax (for withholding estimate)
// ═══════════════════════════════════════════

function calculatePHTaxMonthly(annualizedIncome: number): number {
    // TRAIN Law brackets
    if (annualizedIncome <= 250000) return 0
    if (annualizedIncome <= 400000) return (annualizedIncome - 250000) * 0.15
    if (annualizedIncome <= 800000) return 22500 + (annualizedIncome - 400000) * 0.20
    if (annualizedIncome <= 2000000) return 102500 + (annualizedIncome - 800000) * 0.25
    if (annualizedIncome <= 8000000) return 402500 + (annualizedIncome - 2000000) * 0.30
    return 2202500 + (annualizedIncome - 8000000) * 0.35
}

// ═══════════════════════════════════════════
// PUBLIC: Schedule Rotation Helpers
// ═══════════════════════════════════════════

/**
 * Determine if a date is a work day for any rotation pattern (X days work, Y days rest)
 */
export function isRotationWorkDay(
    date: string,
    cycleStartDate: string,
    workDays: number = 2,
    restDays: number = 2
): boolean {
    if (!cycleStartDate) return true
    const d = new Date(date)
    const start = new Date(cycleStartDate)
    const cycleLength = workDays + restDays
    if (cycleLength <= 0) return true

    const diffDays = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const positionInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength
    return positionInCycle < workDays
}

/**
 * Backward compatibility alias for 2-2 schedule
 */
export function is22WorkDay(date: string, cycleStartDate: string): boolean {
    return isRotationWorkDay(date, cycleStartDate, 2, 2)
}

import { checkHoliday } from "./holidays"

/**
 * Get the auto-detected day type for a date (checks National Holidays first, then schedule rotation)
 */
export function getAutoDayType(date: string, profile: WorkProfile): DayType {
    // 1. Check if date is a National Statutory Holiday for this country
    const holiday = checkHoliday(date, profile.country)
    if (holiday) {
        return holiday.type
    }

    // 2. Evaluate schedule type
    const startDate = profile.cycle_start_date || date

    switch (profile.schedule_type) {
        case "2-2":
            return isRotationWorkDay(date, startDate, 2, 2) ? "regular" : "rest_day"
        case "3-3":
            return isRotationWorkDay(date, startDate, 3, 3) ? "regular" : "rest_day"
        case "4-2":
            return isRotationWorkDay(date, startDate, 4, 2) ? "regular" : "rest_day"
        case "4-3":
            return isRotationWorkDay(date, startDate, 4, 3) ? "regular" : "rest_day"
        case "6-1":
            return isRotationWorkDay(date, startDate, 6, 1) ? "regular" : "rest_day"
        case "3-shift":
            // 3-shift rotation: 6 days work, 2 days rest
            return isRotationWorkDay(date, startDate, 6, 2) ? "regular" : "rest_day"
        case "5-2": {
            // Mon-Fri = regular, Sat-Sun = rest day
            const dayOfWeek = new Date(date).getDay()
            return (dayOfWeek >= 1 && dayOfWeek <= 5) ? "regular" : "rest_day"
        }
        case "custom": {
            const workDays = profile.custom_work_days || 2
            const restDays = profile.custom_rest_days || 2
            return isRotationWorkDay(date, startDate, workDays, restDays) ? "regular" : "rest_day"
        }
        default:
            return "regular"
    }
}
