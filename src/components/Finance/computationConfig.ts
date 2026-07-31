/**
 * Computation Config — Editable constants for salary, OT, tax calculations
 * All values stored in localStorage so the user can override defaults from Settings.
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface TWComputationConfig {
    // Salary & OT
    regularHoursPerDay: number
    otTier1Multiplier: number       // first 2 OT hours
    otTier2Multiplier: number       // hours 3-4 OT
    restDayBaseMultiplier: number   // first 8 hours on rest day
    restDayOtTier1: number          // hours 9-10 on rest day
    restDayOtTier2: number          // hours 11+ on rest day
    holidayMultiplier: number       // regular holiday base
    specialHolidayMultiplier: number
    typhoonDayMultiplier: number
    nightDifferentialFlat: number   // NT$ per hour
    monthlySalaryDivisor: number    // for monthly-rate → hourly conversion
    hourlyBenchmarkHours: number    // monthly hours for hourly workers

    // Tax
    withholdingRate: number         // flat foreign worker rate (0.18 = 18%)
    residentThresholdDays: number   // days for resident status
    standardDeduction: number
    personalExemption: number
    salaryDeduction: number
    laborInsuranceEstimate: number  // annual
    nhiEstimate: number             // annual
}

export interface PHComputationConfig {
    // Salary & OT
    regularHoursPerDay: number
    otMultiplier: number            // regular day OT
    restDayBase: number             // rest day regular hours
    restDayOt: number               // rest day overtime
    holidayOt: number               // regular holiday OT
    holidayMultiplier: number       // regular holiday base
    specialHolidayBase: number
    specialHolidayOt: number
    typhoonDayMultiplier: number
    typhoonDayOt: number
    nightDifferentialPercent: number // % of hourly rate (0.10 = 10%)
    monthlyHours52: number          // 5-2 schedule
    monthlyHours61: number          // 6-1 schedule

    // Tax & Contributions
    sssRate: number                 // employee share (0.045 = 4.5%)
    sssMonthyCap: number
    philHealthRate: number          // employee share (0.025 = 2.5%)
    philHealthMonthlyCap: number
    pagIbigRate: number             // employee share (0.02 = 2%)
    pagIbigMonthlyCap: number
    thirteenthMonthExempt: number   // tax-exempt threshold
}

export interface ComputationConfig {
    tw: TWComputationConfig
    ph: PHComputationConfig
}

// ═══════════════════════════════════════════
// DEFAULTS (current hardcoded values)
// ═══════════════════════════════════════════

export const DEFAULT_COMPUTATION_CONFIG: ComputationConfig = {
    tw: {
        // Salary & OT
        regularHoursPerDay: 8,
        otTier1Multiplier: 1.34,
        otTier2Multiplier: 1.67,
        restDayBaseMultiplier: 1.34,
        restDayOtTier1: 1.67,
        restDayOtTier2: 2.67,
        holidayMultiplier: 2.0,
        specialHolidayMultiplier: 1.34,
        typhoonDayMultiplier: 2.0,
        nightDifferentialFlat: 20,
        monthlySalaryDivisor: 240,
        hourlyBenchmarkHours: 173.2,

        // Tax
        withholdingRate: 0.18,
        residentThresholdDays: 183,
        standardDeduction: 131000,
        personalExemption: 97000,
        salaryDeduction: 218000,
        laborInsuranceEstimate: 12000,
        nhiEstimate: 10000,
    },
    ph: {
        // Salary & OT
        regularHoursPerDay: 8,
        otMultiplier: 1.25,
        restDayBase: 1.30,
        restDayOt: 1.69,
        holidayOt: 2.60,
        holidayMultiplier: 2.0,
        specialHolidayBase: 1.30,
        specialHolidayOt: 1.69,
        typhoonDayMultiplier: 2.0,
        typhoonDayOt: 2.60,
        nightDifferentialPercent: 0.10,
        monthlyHours52: 176,
        monthlyHours61: 208,

        // Tax & Contributions
        sssRate: 0.045,
        sssMonthyCap: 1350,
        philHealthRate: 0.025,
        philHealthMonthlyCap: 500,
        pagIbigRate: 0.02,
        pagIbigMonthlyCap: 200,
        thirteenthMonthExempt: 90000,
    },
}

// ═══════════════════════════════════════════
// STORAGE KEY
// ═══════════════════════════════════════════

const STORAGE_KEY = "finance_computation_config"

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
    const result = { ...defaults }
    for (const key of Object.keys(overrides) as (keyof T)[]) {
        const val = overrides[key]
        if (val !== undefined && val !== null) {
            if (typeof val === "object" && !Array.isArray(val) && typeof defaults[key] === "object") {
                result[key] = deepMerge(defaults[key] as any, val as any)
            } else {
                result[key] = val as T[keyof T]
            }
        }
    }
    return result
}

// ═══════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════

/**
 * Get the current computation config (defaults merged with user overrides)
 */
export function getComputationConfig(): ComputationConfig {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const overrides = JSON.parse(stored)
            return {
                tw: deepMerge(DEFAULT_COMPUTATION_CONFIG.tw, overrides.tw || {}),
                ph: deepMerge(DEFAULT_COMPUTATION_CONFIG.ph, overrides.ph || {}),
            }
        }
    } catch (e) {
        console.warn("Error reading computation config from localStorage:", e)
    }
    return { ...DEFAULT_COMPUTATION_CONFIG }
}

/**
 * Save user overrides (partial — only store changed values)
 */
export function saveComputationConfig(config: Partial<{ tw: Partial<TWComputationConfig>; ph: Partial<PHComputationConfig> }>): void {
    try {
        const existing = getStoredOverrides()
        const merged = {
            tw: { ...existing.tw, ...(config.tw || {}) },
            ph: { ...existing.ph, ...(config.ph || {}) },
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    } catch (e) {
        console.warn("Error saving computation config:", e)
    }
}

/**
 * Reset all overrides back to defaults
 */
export function resetComputationConfig(): void {
    localStorage.removeItem(STORAGE_KEY)
}

/**
 * Get only the user's stored overrides (without defaults merged in)
 */
export function getStoredOverrides(): Partial<{ tw: Partial<TWComputationConfig>; ph: Partial<PHComputationConfig> }> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) return JSON.parse(stored)
    } catch (e) {
        // ignore
    }
    return {}
}
