import type { CurrencyCode } from "./types"

export type ExchangeRates = Record<CurrencyCode, number>

// Default fallback rates (relative to USD = 1.0)
export const DEFAULT_RATES_IN_USD: ExchangeRates = {
    USD: 1,
    PHP: 58.5,     // 1 USD = ~58.5 PHP (1 NTD ≈ 1.8 PHP)
    NTD: 32.5,     // 1 USD = ~32.5 NTD (TWD)
    EUR: 0.92,     // 1 USD = ~0.92 EUR
    JPY: 155.0,    // 1 USD = ~155 JPY
    GBP: 0.78,     // 1 USD = ~0.78 GBP
    CAD: 1.36,     // 1 USD = ~1.36 CAD
    AUD: 1.50,     // 1 USD = ~1.50 AUD
    SGD: 1.34,     // 1 USD = ~1.34 SGD
    HKD: 7.80,     // 1 USD = ~7.80 HKD
    KRW: 1380.0,   // 1 USD = ~1380 KRW
    BTC: 0.0000105,// 1 USD = 0.0000105 BTC (~$95,000 per BTC)
    ETH: 0.00037,  // 1 USD = 0.00037 ETH (~$2,700 per ETH)
    USDT: 1.0,     // 1 USD = 1.0 USDT
    SOL: 0.0055,   // 1 USD = 0.0055 SOL (~$180 per SOL)
}

const RATES_CACHE_KEY = "finance_exchange_rates"
const CUSTOM_RATES_KEY = "finance_custom_exchange_rates"
const BASE_CURRENCY_KEY = "finance_primary_base_currency"

/**
 * Fetch live exchange rates with caching & fallback to default rates
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
    const cached = localStorage.getItem(RATES_CACHE_KEY)
    if (cached) {
        try {
            const { rates, timestamp } = JSON.parse(cached)
            // Cache valid for 2 hours
            if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
                return { ...DEFAULT_RATES_IN_USD, ...rates }
            }
        } catch {
            // Ignore cache parse error
        }
    }

    try {
        // Fetch fiat rates (relative to USD)
        const response = await fetch("https://open.er-api.com/v6/latest/USD")
        const data = await response.json()

        if (data && data.rates) {
            const liveRates: Partial<ExchangeRates> = {
                USD: 1,
                PHP: data.rates.PHP || DEFAULT_RATES_IN_USD.PHP,
                NTD: data.rates.TWD || data.rates.NTD || DEFAULT_RATES_IN_USD.NTD,
                EUR: data.rates.EUR || DEFAULT_RATES_IN_USD.EUR,
                JPY: data.rates.JPY || DEFAULT_RATES_IN_USD.JPY,
                GBP: data.rates.GBP || DEFAULT_RATES_IN_USD.GBP,
                CAD: data.rates.CAD || DEFAULT_RATES_IN_USD.CAD,
                AUD: data.rates.AUD || DEFAULT_RATES_IN_USD.AUD,
                SGD: data.rates.SGD || DEFAULT_RATES_IN_USD.SGD,
                HKD: data.rates.HKD || DEFAULT_RATES_IN_USD.HKD,
                KRW: data.rates.KRW || DEFAULT_RATES_IN_USD.KRW,
            }

            // Fetch crypto rates via Binance/CoinGecko public endpoints if possible
            try {
                const btcRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
                const btcData = await btcRes.json()
                if (btcData && btcData.price) {
                    liveRates.BTC = 1 / parseFloat(btcData.price)
                }

                const ethRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT")
                const ethData = await ethRes.json()
                if (ethData && ethData.price) {
                    liveRates.ETH = 1 / parseFloat(ethData.price)
                }

                const solRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT")
                const solData = await solRes.json()
                if (solData && solData.price) {
                    liveRates.SOL = 1 / parseFloat(solData.price)
                }
            } catch (err) {
                console.warn("Crypto rates fetch fallback:", err)
            }

            const combinedRates = { ...DEFAULT_RATES_IN_USD, ...liveRates }
            localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: combinedRates, timestamp: Date.now() }))
            return combinedRates
        }
    } catch (e) {
        console.warn("Exchange rates fetch failed, using stored/default rates:", e)
    }

    return DEFAULT_RATES_IN_USD
}

/**
 * Get user manual custom rate overrides
 */
export function getCustomExchangeRates(): Partial<ExchangeRates> {
    try {
        const stored = localStorage.getItem(CUSTOM_RATES_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch {
        return {}
    }
}

/**
 * Save user manual custom rate overrides
 */
export function saveCustomExchangeRates(rates: Partial<ExchangeRates>): void {
    localStorage.setItem(CUSTOM_RATES_KEY, JSON.stringify(rates))
}

/**
 * Get user primary base currency (default: "PHP")
 */
export function getPrimaryBaseCurrency(): CurrencyCode {
    const stored = localStorage.getItem(BASE_CURRENCY_KEY)
    return (stored as CurrencyCode) || "PHP"
}

/**
 * Save primary base currency
 */
export function savePrimaryBaseCurrency(currency: CurrencyCode): void {
    localStorage.setItem(BASE_CURRENCY_KEY, currency)
}

/**
 * Convert an amount from one currency to another using exchange rates (in USD)
 */
export function convertCurrency(
    amount: number,
    fromCurrency: CurrencyCode = "PHP",
    toCurrency: CurrencyCode = "PHP",
    liveRates: ExchangeRates = DEFAULT_RATES_IN_USD,
    customRates: Partial<ExchangeRates> = {}
): number {
    if (fromCurrency === toCurrency) return amount
    if (!amount || isNaN(amount)) return 0

    // Apply custom rate if available, otherwise use live rate
    const fromRateInUSD = customRates[fromCurrency] ?? liveRates[fromCurrency] ?? DEFAULT_RATES_IN_USD[fromCurrency] ?? 1
    const toRateInUSD = customRates[toCurrency] ?? liveRates[toCurrency] ?? DEFAULT_RATES_IN_USD[toCurrency] ?? 1

    // Convert from -> USD -> to
    const amountInUSD = amount / fromRateInUSD
    return amountInUSD * toRateInUSD
}

/**
 * Get direct exchange rate between two currencies (e.g. NTD to PHP: returns ~1.8)
 */
export function getDirectRate(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    liveRates: ExchangeRates = DEFAULT_RATES_IN_USD,
    customRates: Partial<ExchangeRates> = {}
): number {
    return convertCurrency(1, fromCurrency, toCurrency, liveRates, customRates)
}
