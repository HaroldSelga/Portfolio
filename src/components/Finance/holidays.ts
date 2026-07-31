/**
 * Official Public Holidays for Taiwan (🇹🇼) and Philippines (🇵🇭)
 * Automatic detection helper for Salary & Overtime calculations
 * Now supports user-added custom holidays via localStorage.
 */

export interface Holiday {
    date: string // YYYY-MM-DD
    name: string
    country: "TW" | "PH"
    type: "regular_holiday" | "special_holiday"
    isCustom?: boolean
}

export const OFFICIAL_HOLIDAYS: Holiday[] = [
    // ═══════════════════════════════════════════
    // TAIWAN (🇹🇼) STATUTORY HOLIDAYS (2026 - 16 Statutory Days per 勞基法 §37)
    // ═══════════════════════════════════════════
    { date: "2026-01-01", name: "Founding Day / New Year's Day (中華民國開國紀念日)", country: "TW", type: "regular_holiday" },
    { date: "2026-02-16", name: "Lunar New Year's Eve (農曆除夕)", country: "TW", type: "regular_holiday" },
    { date: "2026-02-17", name: "Spring Festival Day 1 (農曆正月初一)", country: "TW", type: "regular_holiday" },
    { date: "2026-02-18", name: "Spring Festival Day 2 (農曆正月初二)", country: "TW", type: "regular_holiday" },
    { date: "2026-02-19", name: "Spring Festival Day 3 (農曆正月初三)", country: "TW", type: "regular_holiday" },
    { date: "2026-02-20", name: "Spring Festival Day 4 (農曆正月初四)", country: "TW", type: "regular_holiday" },
    { date: "2026-02-28", name: "Peace Memorial Day (和平紀念日)", country: "TW", type: "regular_holiday" },
    { date: "2026-04-04", name: "Children's Day (兒童節)", country: "TW", type: "regular_holiday" },
    { date: "2026-04-05", name: "Tomb Sweeping Day / Qingming (清明節)", country: "TW", type: "regular_holiday" },
    { date: "2026-05-01", name: "Labor Day (勞動節)", country: "TW", type: "regular_holiday" },
    { date: "2026-06-19", name: "Dragon Boat Festival (端午節)", country: "TW", type: "regular_holiday" },
    { date: "2026-09-25", name: "Mid-Autumn Festival (中秋節)", country: "TW", type: "regular_holiday" },
    { date: "2026-09-28", name: "Teachers' Day / Confucius Birthday (孔子誕辰紀念日)", country: "TW", type: "regular_holiday" },
    { date: "2026-10-10", name: "National Day / Double Tenth (國慶日)", country: "TW", type: "regular_holiday" },
    { date: "2026-10-25", name: "Taiwan Retrocession Day (台灣光復節)", country: "TW", type: "regular_holiday" },
    { date: "2026-12-25", name: "Constitution Day (行憲紀念日)", country: "TW", type: "regular_holiday" },

    // ═══════════════════════════════════════════
    // PHILIPPINES (🇵🇭) NATIONAL HOLIDAYS (2026 - Proclamation 1006)
    // ═══════════════════════════════════════════
    { date: "2026-01-01", name: "New Year's Day", country: "PH", type: "regular_holiday" },
    { date: "2026-02-17", name: "Chinese New Year", country: "PH", type: "special_holiday" },
    { date: "2026-03-20", name: "Eid'l Fitr (Feast of Ramadan)", country: "PH", type: "regular_holiday" },
    { date: "2026-04-02", name: "Maundy Thursday", country: "PH", type: "regular_holiday" },
    { date: "2026-04-03", name: "Good Friday", country: "PH", type: "regular_holiday" },
    { date: "2026-04-04", name: "Black Saturday", country: "PH", type: "special_holiday" },
    { date: "2026-04-09", name: "Araw ng Kagitingan (Day of Valor)", country: "PH", type: "regular_holiday" },
    { date: "2026-05-01", name: "Labor Day", country: "PH", type: "regular_holiday" },
    { date: "2026-06-12", name: "Independence Day", country: "PH", type: "regular_holiday" },
    { date: "2026-08-21", name: "Ninoy Aquino Day", country: "PH", type: "special_holiday" },
    { date: "2026-08-31", name: "National Heroes Day", country: "PH", type: "regular_holiday" },
    { date: "2026-11-01", name: "All Saints' Day", country: "PH", type: "special_holiday" },
    { date: "2026-11-02", name: "All Souls' Day", country: "PH", type: "special_holiday" },
    { date: "2026-11-30", name: "Bonifacio Day", country: "PH", type: "regular_holiday" },
    { date: "2026-12-08", name: "Feast of the Immaculate Conception", country: "PH", type: "special_holiday" },
    { date: "2026-12-24", name: "Christmas Eve", country: "PH", type: "special_holiday" },
    { date: "2026-12-25", name: "Christmas Day", country: "PH", type: "regular_holiday" },
    { date: "2026-12-30", name: "Rizal Day", country: "PH", type: "regular_holiday" },
    { date: "2026-12-31", name: "Last Day of the Year", country: "PH", type: "special_holiday" },
]

// ═══════════════════════════════════════════
// CUSTOM HOLIDAYS (localStorage)
// ═══════════════════════════════════════════

const CUSTOM_HOLIDAYS_KEY = "finance_custom_holidays"

export function getCustomHolidays(): Holiday[] {
    try {
        const stored = localStorage.getItem(CUSTOM_HOLIDAYS_KEY)
        if (stored) {
            return JSON.parse(stored).map((h: Holiday) => ({ ...h, isCustom: true }))
        }
    } catch (e) {
        console.warn("Error reading custom holidays:", e)
    }
    return []
}

export function saveCustomHolidays(holidays: Holiday[]): void {
    try {
        localStorage.setItem(CUSTOM_HOLIDAYS_KEY, JSON.stringify(holidays))
    } catch (e) {
        console.warn("Error saving custom holidays:", e)
    }
}

export function addCustomHoliday(holiday: Omit<Holiday, "isCustom">): Holiday[] {
    const existing = getCustomHolidays()
    // Remove any existing custom holiday on the same date+country
    const filtered = existing.filter(h => !(h.date === holiday.date && h.country === holiday.country))
    const updated = [...filtered, { ...holiday, isCustom: true as const }]
    saveCustomHolidays(updated)
    return updated
}

export function deleteCustomHoliday(date: string, country: "TW" | "PH"): Holiday[] {
    const existing = getCustomHolidays()
    const updated = existing.filter(h => !(h.date === date && h.country === country))
    saveCustomHolidays(updated)
    return updated
}

// ═══════════════════════════════════════════
// MERGED HOLIDAY LIST (official + custom)
// ═══════════════════════════════════════════

/**
 * Get all holidays merged (custom holidays override official on same date+country)
 */
export function getAllHolidays(): Holiday[] {
    const custom = getCustomHolidays()
    const customKeys = new Set(custom.map(h => `${h.date}|${h.country}`))

    // Official holidays that are NOT overridden by custom
    const officialFiltered = OFFICIAL_HOLIDAYS.filter(h => !customKeys.has(`${h.date}|${h.country}`))

    return [...officialFiltered, ...custom].sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Check if a specific date is a national holiday for the given country
 * Custom holidays take priority over official ones.
 */
export function checkHoliday(date: string, country: "TW" | "PH"): Holiday | null {
    // Check custom first (priority)
    const custom = getCustomHolidays()
    const customMatch = custom.find(h => h.date === date && h.country === country)
    if (customMatch) return customMatch

    // Then check official
    return OFFICIAL_HOLIDAYS.find(h => h.date === date && h.country === country) || null
}

/**
 * Get all holidays for a specific country (merged)
 */
export function getHolidaysForCountry(country: "TW" | "PH"): Holiday[] {
    return getAllHolidays().filter(h => h.country === country).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get upcoming holidays from a reference date (defaults to today)
 */
export function getUpcomingHolidays(country: "TW" | "PH", limit: number = 3, fromDate?: string): (Holiday & { daysAway: number })[] {
    const todayStr = fromDate || new Date().toISOString().split("T")[0]
    const today = new Date(todayStr)

    return getAllHolidays()
        .filter(h => h.country === country && h.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, limit)
        .map(h => {
            const hDate = new Date(h.date)
            const diffTime = hDate.getTime() - today.getTime()
            const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return { ...h, daysAway }
        })
}

/**
 * Get holidays for a specific YYYY-MM month (merged)
 */
export function getHolidaysForMonth(yearMonth: string, country: "TW" | "PH"): Holiday[] {
    return getAllHolidays().filter(h => h.country === country && h.date.startsWith(yearMonth))
}
