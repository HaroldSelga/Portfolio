/**
 * Official Public Holidays for Taiwan (🇹🇼) and Philippines (🇵🇭)
 * Automatic detection helper for Salary & Overtime calculations
 */

export interface Holiday {
    date: string // YYYY-MM-DD
    name: string
    country: "TW" | "PH"
    type: "regular_holiday" | "special_holiday"
}

export const OFFICIAL_HOLIDAYS: Holiday[] = [
    // ═══════════════════════════════════════════
    // TAIWAN (🇹🇼) STATUTORY HOLIDAYS (2026)
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
    { date: "2026-10-10", name: "National Day / Double Tenth (國慶日)", country: "TW", type: "regular_holiday" },

    // ═══════════════════════════════════════════
    // PHILIPPINES (🇵🇭) NATIONAL HOLIDAYS (2026)
    // ═══════════════════════════════════════════
    { date: "2026-01-01", name: "New Year's Day", country: "PH", type: "regular_holiday" },
    { date: "2026-01-23", name: "First Philippine Republic Day", country: "PH", type: "special_holiday" },
    { date: "2026-02-17", name: "Chinese New Year", country: "PH", type: "special_holiday" },
    { date: "2026-02-25", name: "EDSA People Power Revolution Anniversary", country: "PH", type: "special_holiday" },
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

/**
 * Check if a specific date is a national holiday for the given country
 */
export function checkHoliday(date: string, country: "TW" | "PH"): Holiday | null {
    return OFFICIAL_HOLIDAYS.find(h => h.date === date && h.country === country) || null
}
