import { stringHash } from "./stringUtils";

export function getCurrency(v, c, rates) {
  const defaultRates = {
    ZAR: 1,
    USD: 1,
    EUR: 1,
  }
  for (const k of Object.keys(defaultRates)) {
    rates[k] = rates[k] || defaultRates[k]
  }
  v = v / rates[c]
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: c !== 'ZAR' ? c : 'USD',
  });
  if (c === 'ZAR') {
    return formatter.format(Math.abs(v)).replace('$', 'R')
  } else {
    return formatter.format(Math.abs(v))
  }
}

export function catColor(t) {
  const colors = {
    "Balance": `#be6fff`,
    "Patreon": `#f44336`,
    "Ad Revenue": `#8BC34A`,
    "Licensing": `#03A9F4`,
    "Corporate Sponsors": `#03A9F4`,
    "Donation from Founder": `#FFEB3B`,
    "Once-off Donations": `#673AB7`,
    "Epic Grant": `#673AB7`,
    "Store Sales": `#795548`,
    "Add-on Sales": `#ea8a0f`,
    "License Sales": `#673AB7`,
    "Crowdfunding": `#eb1478`,
    "Refunds": `#607D8B`,
    "Commissions": `#607D8B`,
    "Tax Refund": `#607D8B`,
    "Founder Salaries": `#9C27B0`,
    "Staff Salaries": `#AB47BC`,
    "Staff Overhead (Taxes)": `#CE93D8`,
    "Training": `#CE93D8`,
    "Contractors": `#BA68C8`,
    "Taxes": `#009688`,
    "Savings (Transfer)": `#FFEB3B`,
    "Web Hosting": `#03A9F4`,
    "Software Licenses": `#8BC34A`,
    "Hardware Purchases": `#3F51B5`,
    "Travel": `#FF9800`,
    "Accounting Fees": `#CDDC39`,
    "Internet": `#4FC3F7`,
    "Insurance": `#9E9E9E`,
    "Bank Charges": `#BDBDBD`,
    "Subscription Fees": `#f44336`,
    "Service Fees": `#78909C`,
    "Catering & Events": `#8BC34A`,
    "BlenderKit": `#6434ff`,
  }
  // Random colors from material design
  const colorSet = [
    'ef5350',
    'ec407a',
    'ab47bc',
    '7e57c2',
    '5c6bc0',
    '42a5f5',
    '29b6f6',
    '26c6da',
    '26a69a',
    '66bb6a',
    '9ccc65',
    'd4e157',
    'ffee58',
    'ffca28',
    'ffa726',
    'ff7043',
    '8d6e63',
    'bdbdbd',
    '78909c',
  ]
  return colors[t] || colorSet[Math.abs(stringHash(t) % colorSet.length)]
}