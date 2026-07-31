/**
 * Tax Calculator — Taiwan & Philippines Tax Estimation Engine
 * Taiwan: 18% flat withholding for foreign workers → progressive resident rates → refund
 * Philippines: TRAIN Law progressive brackets, SSS/PhilHealth/PagIBIG, 13th month tax-exempt
 */

import type { WorkProfile, TaxEstimate } from "./types"
import { getHourlyRate } from "./salaryCalculator"

// ═══════════════════════════════════════════
// TAIWAN TAX CALCULATION
// ═══════════════════════════════════════════

// Taiwan progressive income tax brackets (2024-2026)
const TW_TAX_BRACKETS = [
    { limit: 560000, rate: 0.05, deduction: 0 },
    { limit: 1260000, rate: 0.12, deduction: 39200 },
    { limit: 2520000, rate: 0.20, deduction: 140000 },
    { limit: 4720000, rate: 0.30, deduction: 392000 },
    { limit: Infinity, rate: 0.40, deduction: 864000 },
]

// Taiwan standard deductions for single filer
const TW_DEDUCTIONS = {
    standardDeduction: 131000,   // 標準扣除額 (single)
    personalExemption: 97000,    // 免稅額
    salaryDeduction: 218000,     // 薪資所得特別扣除額
    laborInsuranceEstimate: 12000, // 勞保 (estimated annual)
    nhiEstimate: 10000,          // 健保 (estimated annual)
}

function calculateTWProgressiveTax(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0

    for (const bracket of TW_TAX_BRACKETS) {
        if (taxableIncome <= bracket.limit) {
            return taxableIncome * bracket.rate - bracket.deduction
        }
    }
    // Should not reach here
    const last = TW_TAX_BRACKETS[TW_TAX_BRACKETS.length - 1]
    return taxableIncome * last.rate - last.deduction
}

export function calculateTWTax(
    annualGross: number,
    daysInTW: number,
    yearEndBonus: number = 0,
): TaxEstimate {
    const isResident = daysInTW >= 183
    const totalIncome = annualGross + yearEndBonus

    // Total withheld throughout the year at 18%
    const totalWithheld = totalIncome * 0.18

    let actualTaxOwed: number
    let totalDeductions: number
    let taxableIncome: number

    if (isResident) {
        // Resident: progressive rates with deductions
        totalDeductions =
            TW_DEDUCTIONS.standardDeduction +
            TW_DEDUCTIONS.personalExemption +
            TW_DEDUCTIONS.salaryDeduction +
            TW_DEDUCTIONS.laborInsuranceEstimate +
            TW_DEDUCTIONS.nhiEstimate

        taxableIncome = Math.max(totalIncome - totalDeductions, 0)
        actualTaxOwed = Math.max(calculateTWProgressiveTax(taxableIncome), 0)
    } else {
        // Non-resident: flat 18%, no deductions
        totalDeductions = 0
        taxableIncome = totalIncome
        actualTaxOwed = totalIncome * 0.18
    }

    const estimatedRefund = Math.max(totalWithheld - actualTaxOwed, 0)
    const effectiveRate = totalIncome > 0 ? (actualTaxOwed / totalIncome) * 100 : 0

    return {
        annualGross: totalIncome,
        totalDeductions,
        taxableIncome,
        actualTaxOwed,
        totalWithheld,
        estimatedRefund,
        effectiveRate,
        withholdingRate: 18,
        isResident,
        daysInCountry: daysInTW,
        thirteenthMonth: 0, // TW doesn't have 13th month
        thirteenthMonthTaxable: 0,
        yearEndBonus,
    }
}

// ═══════════════════════════════════════════
// PHILIPPINES TAX CALCULATION
// ═══════════════════════════════════════════

// TRAIN Law annual tax brackets (effective 2023+)
function calculatePHProgressiveTax(taxableIncome: number): number {
    if (taxableIncome <= 250000) return 0
    if (taxableIncome <= 400000) return (taxableIncome - 250000) * 0.15
    if (taxableIncome <= 800000) return 22500 + (taxableIncome - 400000) * 0.20
    if (taxableIncome <= 2000000) return 102500 + (taxableIncome - 800000) * 0.25
    if (taxableIncome <= 8000000) return 402500 + (taxableIncome - 2000000) * 0.30
    return 2202500 + (taxableIncome - 8000000) * 0.35
}

// SSS contribution table (simplified — 2024 rates)
function calculateSSS(monthlySalary: number): number {
    // Employee share: approximately 4.5% of monthly salary, capped
    const rate = 0.045
    const maxContribution = 1350 // approximate monthly cap
    return Math.min(monthlySalary * rate, maxContribution)
}

// PhilHealth contribution (2024: 5% of basic salary, split 50/50)
function calculatePhilHealth(monthlySalary: number): number {
    const rate = 0.025 // employee share = 2.5%
    const maxContribution = 500 // approximate monthly cap
    return Math.min(monthlySalary * rate, maxContribution)
}

// Pag-IBIG contribution
function calculatePagIBIG(monthlySalary: number): number {
    // Employee share: 2% of salary, max ₱200/month
    return Math.min(monthlySalary * 0.02, 200)
}

export function calculatePHTax(
    annualGross: number,
    monthlyBasicSalary: number,
    monthsWorked: number = 12,
): TaxEstimate {
    // Monthly mandatory contributions
    const monthlySSS = calculateSSS(monthlyBasicSalary)
    const monthlyPhilHealth = calculatePhilHealth(monthlyBasicSalary)
    const monthlyPagIBIG = calculatePagIBIG(monthlyBasicSalary)
    const monthlyContributions = monthlySSS + monthlyPhilHealth + monthlyPagIBIG
    const annualContributions = monthlyContributions * monthsWorked

    // 13th month pay calculation (basic salary only ÷ 12)
    const thirteenthMonth = (monthlyBasicSalary * monthsWorked) / 12
    const thirteenthMonthTaxable = Math.max(thirteenthMonth - 90000, 0)

    // Total deductions
    const totalDeductions = annualContributions

    // Taxable income = gross + taxable 13th month - contributions
    // Note: the first ₱90k of 13th month is exempt
    const taxableIncome = Math.max(annualGross + thirteenthMonthTaxable - totalDeductions, 0)

    const actualTaxOwed = calculatePHProgressiveTax(taxableIncome)

    // Estimate total withheld (monthly withholding × months)
    const monthlyTaxable = Math.max((annualGross / monthsWorked) - monthlyContributions, 0)
    const monthlyWithholding = calculatePHProgressiveTax(monthlyTaxable * 12) / 12
    const totalWithheld = monthlyWithholding * monthsWorked

    const estimatedRefund = Math.max(totalWithheld - actualTaxOwed, 0)
    const effectiveRate = annualGross > 0 ? (actualTaxOwed / annualGross) * 100 : 0

    return {
        annualGross,
        totalDeductions,
        taxableIncome,
        actualTaxOwed,
        totalWithheld,
        estimatedRefund,
        effectiveRate,
        withholdingRate: effectiveRate,
        isResident: true,
        daysInCountry: monthsWorked * 30,
        thirteenthMonth,
        thirteenthMonthTaxable,
        yearEndBonus: 0,
    }
}

// ═══════════════════════════════════════════
// PUBLIC: Calculate tax estimate for a profile
// ═══════════════════════════════════════════

export function estimateTax(
    profile: WorkProfile,
    annualGross: number,
    daysInCountry: number = 365,
    monthsWorked: number = 12,
): TaxEstimate {
    const hourlyRate = getHourlyRate(profile)

    if (profile.country === "TW") {
        const monthlyBase = profile.rate_type === "monthly"
            ? profile.base_rate
            : hourlyRate * 8 * 22
        const yearEndBonus = monthlyBase * (profile.year_end_bonus_multiplier || 1)
        return calculateTWTax(annualGross, daysInCountry, yearEndBonus)
    } else {
        const monthlyBasic = profile.rate_type === "monthly"
            ? profile.base_rate
            : hourlyRate * 8 * 22
        return calculatePHTax(annualGross, monthlyBasic, monthsWorked)
    }
}
