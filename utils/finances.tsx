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
    "Corporate Sponsors": `#03A9F4`,
    "Donation from Founder": `#FFEB3B`,
    "Once-off Donations": `#673AB7`,
    "Store Sales": `#795548`,
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
    "Service Fees": `#78909C`
  }
  return colors[t] || `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`
}