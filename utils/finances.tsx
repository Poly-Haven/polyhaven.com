import { stringHash } from "./stringUtils";

export const categories = {
  "Balance": {
    description: "Our current balance accross all accounts.",
    color: `#be6fff`,
  },
  "Patreon": {
    description: "Donations by individuals on patreon.com.",
    color: `#f44336`,
  },
  "Ad Revenue": {
    description: "Revenue from advertisements on the website.",
    color: `#8BC34A`,
  },
  "Corporate Sponsors": {
    description: "Sponsorships from companies (check logos at the bottom of the site).",
    color: `#03A9F4`,
  },
  "Donation from Founder": {
    description: "Money contributed to Poly Haven by either Greg or Rob.",
    color: `#FFEB3B`,
  },
  "Once-off Donations": {
    description: "Single donations from individuals.",
    color: `#673AB7`,
  },
  "Epic Grant": {
    description: "Funding given by Epic Games to create assets.",
    color: `#bbbbbb`,
  },
  "Store Sales": {
    description: "Sales of asset bundles on various online marketplaces.",
    color: `#795548`,
  },
  "Add-on Sales": {
    description: "Sales of our Blender add-on on the Blender Market.",
    color: `#ea8a0f`,
  },
  "License Sales": {
    description: "One-time sales of bespoke license agreements to companies who require something more custom than CC0.",
    color: `#673AB7`,
  },
  "Crowdfunding": {
    description: "Funding from crowdfunding campaigns.",
    color: `#eb1478`,
  },
  "Refunds": {
    description: "Refunds of purchases.",
    color: `#607D8B`,
  },
  "Commissions": {
    description: "Private work for by individuals or companies.",
    color: `#607D8B`,
  },
  "Tax Refund": {
    description: "Refund of excess tax paid.",
    color: `#607D8B`,
  },
  "Founder Salaries": {
    description: "Salaries paid to Greg and Rob.",
    color: `#9C27B0`,
  },
  "Staff Salaries": {
    description: "Salaries paid to core staff members.",
    color: `#AB47BC`,
  },
  "Staff Overhead (Taxes)": {
    description: "Income tax and other obligations paid on behalf of staff.",
    color: `#CE93D8`,
  },
  "Training": {
    description: "Courses, training and personal development of staff.",
    color: `#CE93D8`,
  },
  "Contractors": {
    description: "Purchases of assets from independant contractors or vendors.",
    color: `#BA68C8`,
  },
  "Taxes": {
    description: "Various obligatory taxes paid.",
    color: `#009688`,
  },
  "Savings (Transfer)": {
    description: "Transfer of funds to/from savings accounts.",
    color: `#FFEB3B`,
  },
  "Web Hosting": {
    description: "Various services required to keep the website running.",
    color: `#03A9F4`,
  },
  "Software Licenses": {
    description: "Various software and tools required to produce assets and facilitate colllaboration.",
    color: `#8BC34A`,
  },
  "Hardware Purchases": {
    description: "Purchases of computers, camera equipment, and various other hardware.",
    color: `#3F51B5`,
  },
  "Travel": {
    description: "Includes flights, accommodation, and other travel expenses - as well as general staff transport.",
    color: `#FF9800`,
  },
  "Accounting Fees": {
    description: "Various fees paid to accountants and other financial advisors.",
    color: `#CDDC39`,
  },
  "Internet": {
    description: "Internet access and related services at our primary office.",
    color: `#4FC3F7`,
  },
  "Insurance": {
    description: "Insurance policies for company assets and staff.",
    color: `#9E9E9E`,
  },
  "Bank Charges": {
    description: "Various bank fees.",
    color: `#BDBDBD`,
  },
  "Subscription Fees": {
    description: "Various recurring subscription fees for services we rely on.",
    color: `#f44336`,
  },
  "Service Fees": {
    description: "Various fees paid to service providers.",
    color: `#78909C`,
  },
  "Catering & Events": {
    description: "Food and other costs associated with events and gatherings.",
    color: `#8BC34A`,
  },
  "BlenderKit": {
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