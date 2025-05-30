import { stringHash } from './stringUtils'

export const categories = {
  Balance: {
    description: 'Our current balance accross all accounts.',
    color: `#be6fff`,
  },
  Patreon: {
    description: 'Donations by individuals on patreon.com.',
    color: `#f44336`,
  },
  'Ad Revenue': {
    description: 'Revenue from advertisements on the website.',
    color: `#8BC34A`,
  },
  'Corporate Sponsors': {
    description: 'Sponsorships from companies (check logos at the bottom of the site).',
    color: `#03A9F4`,
  },
  'Donation from Founder': {
    description: 'Money contributed to Poly Haven by either Greg or Rob.',
    color: `#FFEB3B`,
  },
  'Once-off Donations': {
    description: 'Single donations from individuals.',
    color: `#673AB7`,
  },
  'Epic Grant': {
    description: 'Funding given by Epic Games to create assets.',
    color: `#bbbbbb`,
  },
  'Store Sales': {
    description: 'Sales of asset bundles on various online marketplaces.',
    color: `#795548`,
  },
  'Add-on Sales': {
    description: 'Sales of our Blender add-on on the Blender Market.',
    color: `#ea8a0f`,
  },
  'License Sales': {
    description:
      'One-time sales of bespoke license agreements to companies who require something more custom than CC0.',
    color: `#673AB7`,
  },
  Crowdfunding: {
    description: 'Funding from crowdfunding campaigns.',
    color: `#eb1478`,
  },
  Refunds: {
    description: 'Refunds of purchases.',
    color: `#607D8B`,
  },
  Commissions: {
    description: 'Private work for by individuals or companies.',
    color: `#607D8B`,
  },
  'Tax Refund': {
    description: 'Refund of excess tax paid.',
    color: `#607D8B`,
  },
  'Founder Salaries': {
    description: 'Salaries paid to Greg and Rob.',
    color: `#9C27B0`,
  },
  'Staff Salaries': {
    description: 'Salaries paid to core staff members.',
    color: `#AB47BC`,
  },
  'Staff Overhead (Taxes)': {
    description: 'Income tax and other obligations paid on behalf of staff.',
    color: `#CE93D8`,
  },
  Training: {
    description: 'Courses, training and personal development of staff.',
    color: `#CE93D8`,
  },
  Contractors: {
    description: 'Purchases of assets from independant contractors or vendors.',
    color: `#BA68C8`,
  },
  Taxes: {
    description: 'Various obligatory taxes paid.',
    color: `#009688`,
  },
  'Savings (Transfer)': {
    description: 'Transfer of funds to/from savings accounts.',
    color: `#FFEB3B`,
  },
  'Web Hosting': {
    description: 'Various services required to keep the website running.',
    color: `#03A9F4`,
  },
  'Software Licenses': {
    description: 'Various software and tools required to produce assets and facilitate colllaboration.',
    color: `#8BC34A`,
  },
  'Hardware Purchases': {
    description: 'Purchases of computers, camera equipment, and various other hardware.',
    color: `#3F51B5`,
  },
  Travel: {
    description: 'Includes flights, accommodation, and other travel expenses - as well as general staff transport.',
    color: `#FF9800`,
  },
  'Accounting Fees': {
    description: 'Various fees paid to accountants and other financial advisors.',
    color: `#CDDC39`,
  },
  Internet: {
    description: 'Internet access and related services at our primary office.',
    color: `#4FC3F7`,
  },
  Insurance: {
    description: 'Insurance policies for company assets and staff.',
    color: `#9E9E9E`,
  },
  'Bank Charges': {
    description: 'Various bank fees.',
    color: `#BDBDBD`,
  },
  'Subscription Fees': {
    description: 'Various recurring subscription fees for services we rely on.',
    color: `#f44336`,
  },
  'Service Fees': {
    description: 'Various fees paid to service providers.',
    color: `#78909C`,
  },
  'Catering & Events': {
    description: 'Food and other costs associated with events and gatherings.',
    color: `#8BC34A`,
  },
  BlenderKit: {
    description: "Income from Blenderkit's revenue share program.",
    color: `#6434ff`,
  },
}

export function catColor(t) {
  if (t === 'Ad Revenue') console.log(t)
  if (categories[t]) {
    return categories[t].color
  }

  // Random colors from material design
  const colorSet = [
    '#ef5350',
    '#ec407a',
    '#ab47bc',
    '#7e57c2',
    '#5c6bc0',
    '#42a5f5',
    '#29b6f6',
    '#26c6da',
    '#26a69a',
    '#66bb6a',
    '#9ccc65',
    '#d4e157',
    '#ffee58',
    '#ffca28',
    '#ffa726',
    '#ff7043',
    '#8d6e63',
    '#bdbdbd',
    '#78909c',
  ]
  if (t === 'Ad Revenue') console.log(colorSet[Math.abs(stringHash(t) % colorSet.length)])
  return colorSet[Math.abs(stringHash(t) % colorSet.length)]
}

/**
 * Converts a value from one currency to another and formats it for display
 *
 * @param {number} amount - The monetary amount to convert
 * @param {string} targetCurrency - The target currency code (e.g., 'USD', 'EUR', 'ZAR')
 * @param {Object} exchangeRates - Object containing exchange rates with currency codes as keys
 * @param {boolean} [showCents=true] - Whether to display cents/decimal places
 * @param {boolean} [compactFormat=false] - Whether to use compact notation for large numbers (e.g., "15K", "1.2M")
 * @returns {string} Formatted currency string with appropriate symbol
 *
 * @example
 * // Convert 100 ZAR to USD with custom rates (shows cents by default)
 * const rates = { ZAR: 18.5, USD: 1, EUR: 0.85 };
 * getCurrency(100, 'USD', rates); // Returns "$5.41"
 *
 * @example
 * // Convert to ZAR without cents
 * getCurrency(100, 'ZAR', rates, false); // Returns "R1,850"
 *
 * @example
 * // Convert to ZAR with cents (default behavior)
 * getCurrency(100, 'ZAR', rates, true); // Returns "R1,850.00"
 *
 * @example
 * // Convert large amount with compact formatting
 * getCurrency(1850000, 'USD', rates, true, true); // Returns "$100K"
 *
 * @example
 * // Convert very large amount with compact formatting
 * getCurrency(18500000, 'ZAR', rates, false, true); // Returns "R18.5M"
 */
export function getCurrency(amount, targetCurrency, exchangeRates, showCents = true, compactFormat = false) {
  // Default exchange rates - fallback values if rates are not provided
  const defaultExchangeRates = {
    ZAR: 1, // South African Rand
    USD: 1, // US Dollar
    EUR: 1, // Euro
  }

  // Ensure all required exchange rates are available, using defaults as fallback
  for (const currencyCode of Object.keys(defaultExchangeRates)) {
    exchangeRates[currencyCode] = exchangeRates[currencyCode] || defaultExchangeRates[currencyCode]
  }

  // Convert the amount using the exchange rate for the target currency
  const convertedAmount = amount / exchangeRates[targetCurrency]

  // Create a currency formatter using Intl.NumberFormat
  // Note: ZAR is handled specially since it uses 'R' symbol instead of standard currency symbol
  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: targetCurrency !== 'ZAR' ? targetCurrency : 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }

  // Add compact notation for large numbers if requested
  if (compactFormat) {
    formatOptions.notation = 'compact'
    formatOptions.compactDisplay = 'short'
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', formatOptions)

  // Format the absolute value to avoid negative currency display issues
  const formattedAmount = currencyFormatter.format(Math.abs(convertedAmount))

  // Special handling for South African Rand - replace '$' with 'R'
  if (targetCurrency === 'ZAR') {
    return formattedAmount.replace('$', 'R')
  } else {
    return formattedAmount
  }
}
