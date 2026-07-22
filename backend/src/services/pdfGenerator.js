/**
 * HTML + CSS + Puppeteer PDF Generator Service for Spendly
 * Single Continuous Fluid Flow Architecture
 * Eliminates artificial page breaks; renders passbook table first followed immediately by charts & AI insights.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Resolve official app logo from frontend assets
let logoBase64 = '';
try {
  const iconPath = path.resolve(__dirname, '../../../frontend/assets/icon.png');
  if (fs.existsSync(iconPath)) {
    logoBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`;
  }
} catch (err) {
  console.error('[pdfGenerator] Logo load error:', err);
}

// ─────────────────────────────────────────
// Formatting Utilities
// ─────────────────────────────────────────

function fmt(n) {
  return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateShort(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function fmtTime(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function capitalize(str) {
  if (!str) return 'Other';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─────────────────────────────────────────
// Category Color Themes (Distinct Colors Per Category)
// ─────────────────────────────────────────

const CATEGORY_THEMES = {
  Food:          { bg: '#EFF6FF', color: '#1D4ED8', fill: '#2563EB' },
  Dining:        { bg: '#EFF6FF', color: '#1D4ED8', fill: '#2563EB' },
  Bills:         { bg: '#FFF7ED', color: '#C2410C', fill: '#EA580C' },
  Utilities:     { bg: '#FFF7ED', color: '#C2410C', fill: '#EA580C' },
  Shopping:      { bg: '#FAF5FF', color: '#7E22CE', fill: '#9333EA' },
  Transport:     { bg: '#F0FDFA', color: '#0F766E', fill: '#0D9488' },
  Travel:        { bg: '#F0FDFA', color: '#0F766E', fill: '#0D9488' },
  Entertainment: { bg: '#FDF2F8', color: '#BE185D', fill: '#DB2777' },
  Movies:        { bg: '#FDF2F8', color: '#BE185D', fill: '#DB2777' },
  Health:        { bg: '#ECFDF5', color: '#047857', fill: '#059669' },
  Medical:       { bg: '#ECFDF5', color: '#047857', fill: '#059669' },
  Education:     { bg: '#FEF3C7', color: '#B45309', fill: '#D97706' },
  Groceries:     { bg: '#F0FDF4', color: '#15803D', fill: '#16A34A' },
  Investments:   { bg: '#F5F3FF', color: '#6D28D9', fill: '#7C3AED' },
  Subscriptions: { bg: '#FFF1F2', color: '#BE123C', fill: '#E11D48' },
  Income:        { bg: '#ECFDF5', color: '#047857', fill: '#10B981' },
  Salary:        { bg: '#ECFDF5', color: '#047857', fill: '#10B981' },
  Other:         { bg: '#F8FAFC', color: '#475569', fill: '#64748B' },
};

// Fallback palette generator for any unmapped dynamic category
const DYNAMIC_PALETTE = [
  { bg: '#EFF6FF', color: '#1D4ED8', fill: '#2563EB' },
  { bg: '#ECFDF5', color: '#047857', fill: '#059669' },
  { bg: '#FFF7ED', color: '#C2410C', fill: '#EA580C' },
  { bg: '#FAF5FF', color: '#7E22CE', fill: '#9333EA' },
  { bg: '#FDF2F8', color: '#BE185D', fill: '#DB2777' },
  { bg: '#F0FDFA', color: '#0F766E', fill: '#0D9488' },
  { bg: '#FEF3C7', color: '#B45309', fill: '#D97706' },
  { bg: '#F5F3FF', color: '#6D28D9', fill: '#7C3AED' },
  { bg: '#FFF1F2', color: '#BE123C', fill: '#E11D48' },
];

function getCategoryTheme(name) {
  const norm = capitalize(name);
  if (CATEGORY_THEMES[norm]) return CATEGORY_THEMES[norm];

  for (const key of Object.keys(CATEGORY_THEMES)) {
    if (norm.toLowerCase().includes(key.toLowerCase())) {
      return CATEGORY_THEMES[key];
    }
  }

  // Consistent deterministic hash color for custom categories
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash = norm.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % DYNAMIC_PALETTE.length;
  return DYNAMIC_PALETTE[idx];
}

// ─────────────────────────────────────────
// Vector SVG Donut Chart
// ─────────────────────────────────────────

function generateDonutSVG(categories, totalAmount) {
  if (!categories || categories.length === 0 || totalAmount <= 0) {
    return `<svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="50" fill="#F1F5F9"/></svg>`;
  }

  const cx = 70, cy = 70, r = 52, strokeW = 16;
  let currentAngle = -Math.PI / 2;
  let pathHTML = '';

  const sliceColors = ['#2563EB', '#16A34A', '#F59E0B', '#9333EA', '#EC4899', '#0D9488'];

  categories.slice(0, 6).forEach((cat, idx) => {
    const fraction = cat.amount / totalAmount;
    if (fraction <= 0) return;

    const angle = fraction * 2 * Math.PI;
    const x1 = cx + (r - strokeW / 2) * Math.cos(currentAngle);
    const y1 = cy + (r - strokeW / 2) * Math.sin(currentAngle);

    currentAngle += angle;

    const x2 = cx + (r - strokeW / 2) * Math.cos(currentAngle);
    const y2 = cy + (r - strokeW / 2) * Math.sin(currentAngle);

    const largeArc = fraction > 0.5 ? 1 : 0;
    const color = sliceColors[idx % sliceColors.length];

    pathHTML += `<path d="M ${x1} ${y1} A ${r - strokeW / 2} ${r - strokeW / 2} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${strokeW}" />`;
  });

  return `
    <svg width="140" height="140" viewBox="0 0 140 140">
      ${pathHTML}
      <circle cx="70" cy="70" r="36" fill="#FFFFFF" />
      <text x="70" y="66" text-anchor="middle" font-size="8" font-weight="700" fill="#64748B" letter-spacing="0.5">DEBITS</text>
      <text x="70" y="80" text-anchor="middle" font-size="10" font-weight="800" fill="#0F172A">₹${fmt(totalAmount)}</text>
    </svg>
  `;
}

// ─────────────────────────────────────────
// Dynamic AI Summary Generator
// ─────────────────────────────────────────

function generateAISummary(sorted, totalExp, totalInc, cats, pms) {
  const topCat = cats[0] ? `${cats[0].name} (${cats[0].pct.toFixed(1)}%)` : 'General Expenses';
  const topPayment = pms[0] ? pms[0].name : 'UPI';
  const netSavings = totalInc - totalExp;
  const savingsPct = totalInc > 0 ? ((netSavings / totalInc) * 100).toFixed(1) : 0;

  return `During this statement period, your highest spending occurred in ${topCat}, representing the largest proportion of total debits. ${topPayment} served as your principal transaction channel. Across ${sorted.length} records, your portfolio achieved a net balance shift of ₹${fmt(netSavings)} (Savings Rate: ${savingsPct}%).`;
}

// ─────────────────────────────────────────
// Continuous Fluid Template Engine
// ─────────────────────────────────────────

function buildHTMLTemplate(user, txns, opts) {
  const { startDate, endDate, openingBalance = 0 } = opts;

  const sorted = [...txns].sort((a, b) => new Date(a.date) - new Date(b.date));

  const expenses = sorted.filter(t => t.type !== 'income');
  const incomes  = sorted.filter(t => t.type === 'income');
  const totalExp = expenses.reduce((s, t) => s + (t.amount || 0), 0);
  const totalInc = incomes.reduce((s, t)  => s + (t.amount || 0), 0);
  const netSavings = totalInc - totalExp;
  const closingBal = openingBalance + netSavings;

  const avgExp = expenses.length ? totalExp / expenses.length : 0;
  const avgInc = incomes.length ? totalInc / incomes.length : 0;
  const highestExpVal = expenses.reduce((max, t) => Math.max(max, t.amount || 0), 0);
  const highestIncVal = incomes.reduce((max, t) => Math.max(max, t.amount || 0), 0);

  // Dynamic Member Since resolution
  const memberSince = user.createdAt ? fmtDate(user.createdAt) : 'May 2024';

  // Categories
  const catMap = {};
  expenses.forEach(t => {
    const c = capitalize(t.category);
    if (!catMap[c]) catMap[c] = { amount: 0, count: 0 };
    catMap[c].amount += t.amount || 0;
    catMap[c].count  += 1;
  });
  const cats = Object.entries(catMap)
    .map(([name, d]) => ({ name, amount: d.amount, count: d.count, pct: totalExp > 0 ? (d.amount / totalExp) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // Payment Methods
  const pmMap = {};
  sorted.forEach(t => {
    const p = capitalize(t.paymentMethod);
    if (!pmMap[p]) pmMap[p] = { amount: 0, count: 0 };
    pmMap[p].amount += t.amount || 0;
    pmMap[p].count  += 1;
  });
  const totalPmAmount = Object.values(pmMap).reduce((s, d) => s + d.amount, 0);
  const pms = Object.entries(pmMap)
    .map(([name, d]) => ({ name, amount: d.amount, count: d.count, pct: totalPmAmount > 0 ? (d.amount / totalPmAmount) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const aiText = generateAISummary(sorted, totalExp, totalInc, cats, pms);
  const pieSVG = generateDonutSVG(cats, totalExp);

  let runningBal = openingBalance;

  // Build passbook table rows
  const tableRowsHTML = sorted.map((t, idx) => {
    const isInc = t.type === 'income';
    if (isInc) runningBal += t.amount;
    else runningBal -= t.amount;

    const theme = getCategoryTheme(t.category);
    const rowClass = idx % 2 === 0 ? 'even-row' : 'odd-row';

    return `
      <tr class="${rowClass}">
        <td class="date-cell">
          <div class="bold">${fmtDateShort(t.date)}</div>
          <div class="muted-sm">${fmtTime(t.date)}</div>
        </td>
        <td class="desc-cell">
          <div class="desc-title">${t.reason || '—'}</div>
          ${t.notes ? `<div class="work-stmt">Work Statement: ${t.notes}</div>` : ''}
        </td>
        <td>
          <span class="cat-badge" style="background:${theme.bg}; color:${theme.color}; border:1px solid ${theme.color}30;">
            ${capitalize(t.category)}
          </span>
        </td>
        <td class="pm-cell">${capitalize(t.paymentMethod)}</td>
        <td class="num-cell exp-text">${isInc ? '—' : '₹' + fmt(t.amount)}</td>
        <td class="num-cell inc-text">${isInc ? '₹' + fmt(t.amount) : '—'}</td>
        <td class="num-cell bold">₹${fmt(runningBal)}</td>
      </tr>
    `;
  }).join('');

  const logoHTML = logoBase64 
    ? `<img src="${logoBase64}" class="app-logo-img" alt="Spendly Logo" />` 
    : `<div class="app-logo-fallback">S</div>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Spendly Financial Statement</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #0F172A;
        background: #FFFFFF;
        font-size: 11px;
        line-height: 1.4;
      }

      /* HEADER CONTAINER */
      .header-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #F1F5F9;
        padding-bottom: 14px;
        margin-bottom: 16px;
      }
      .brand-box {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .app-logo-img {
        height: 40px;
        width: 40px;
        border-radius: 50%;
        object-fit: cover;
        overflow: hidden;
      }
      .app-logo-fallback {
        width: 40px;
        height: 40px;
        background: #2563EB;
        border-radius: 10px;
        color: #FFF;
        font-weight: 800;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .brand-title { font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.6px; }
      .brand-tagline { font-size: 9px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.8px; }

      .meta-box {
        text-align: right;
        font-size: 9.5px;
        color: #475569;
        line-height: 1.4;
      }
      .meta-box strong { color: #0F172A; }

      /* COVER TITLE & PROFILES */
      .doc-title-bar {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .title-head { font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px; }
      .title-sub { font-size: 9.5px; font-weight: 600; color: #64748B; margin-top: 2px; }

      .user-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #FFFFFF;
        border: 1px solid #CBD5E1;
        border-radius: 20px;
        padding: 6px 14px;
      }
      .user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        background: #2563EB;
        color: #FFF;
        font-weight: 800;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* METRIC CARDS GRID */
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin-bottom: 16px;
      }
      .metric-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 10px 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .metric-label { font-size: 8.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
      .metric-value { font-size: 12.5px; font-weight: 800; margin-top: 3px; }
      .blue-val { color: #2563EB; }
      .green-val { color: #16A34A; }
      .red-val { color: #DC2626; }
      .purple-val { color: #9333EA; }

      /* SECTION HEADERS */
      .section-heading {
        font-size: 13px;
        font-weight: 800;
        color: #0F172A;
        margin: 18px 0 10px 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* PASSBOOK TABLE */
      table.passbook-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      table.passbook-table thead {
        display: table-header-group;
      }
      table.passbook-table th {
        background: #0F172A;
        color: #FFFFFF;
        font-weight: 700;
        font-size: 9px;
        text-transform: uppercase;
        padding: 8px 10px;
        text-align: left;
      }
      table.passbook-table th.text-right { text-align: right; }
      table.passbook-table td {
        padding: 8px 10px;
        border-bottom: 1px solid #E2E8F0;
      }
      .even-row { background: #FFFFFF; }
      .odd-row { background: #F8FAFC; }
      .desc-title { font-weight: 700; font-size: 10px; color: #0F172A; }
      .work-stmt { font-size: 8.5px; color: #64748B; margin-top: 2px; }
      .cat-badge {
        display: inline-block;
        font-size: 8px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
      }
      .num-cell { text-align: right; font-size: 10px; }
      .exp-text { color: #DC2626; font-weight: 700; }
      .inc-text { color: #16A34A; font-weight: 700; }
      .bold { font-weight: 700; }
      .muted-sm { font-size: 8px; color: #64748B; }

      /* CHARTS & BREAKDOWN ROW */
      .breakdown-row {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
        page-break-inside: avoid;
      }
      .panel-card {
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 12px 14px;
        background: #FFFFFF;
      }
      .panel-head { font-size: 11px; font-weight: 700; color: #0F172A; margin-bottom: 10px; border-bottom: 1px solid #F1F5F9; padding-bottom: 4px; }

      .pm-item { margin-bottom: 6px; }
      .pm-head { display: flex; justify-content: space-between; font-size: 9px; font-weight: 600; margin-bottom: 3px; }
      .pm-track { height: 5px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
      .pm-fill { height: 100%; background: #2563EB; border-radius: 3px; }

      /* AI SUMMARY BANNER */
      .ai-banner {
        background: #EFF6FF;
        border: 1px solid #BFDBFE;
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 16px;
        page-break-inside: avoid;
      }
      .ai-banner-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 800;
        color: #1D4ED8;
        margin-bottom: 4px;
      }
      .ai-banner-body { font-size: 10px; color: #1E40AF; line-height: 1.5; }

      /* FOOTER */
      .footer-bar {
        border-top: 1px solid #E2E8F0;
        padding-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 8.5px;
        color: #64748B;
        margin-top: 16px;
      }

      @media print {
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    
    <!-- BRAND HEADER -->
    <div class="header-wrap">
      <div class="brand-box">
        ${logoHTML}
        <div>
          <div class="brand-title">Spendly</div>
          <div class="brand-tagline">AI Powered Personal Finance Manager</div>
        </div>
      </div>
      <div class="meta-box">
        <div><strong>Statement Period:</strong> ${fmtDateShort(startDate)} to ${fmtDateShort(endDate)}</div>
        <div><strong>Generated:</strong> ${fmtDate(new Date())}, ${fmtTime(new Date())}</div>
        <div><strong>Member Since:</strong> ${memberSince}</div>
      </div>
    </div>

    <!-- TITLE & USER BAR -->
    <div class="doc-title-bar">
      <div>
        <div class="title-head">Expense Statement</div>
        <div class="title-sub">Official Financial Activity Record</div>
      </div>
      <div class="user-pill">
        <div class="user-avatar">${(user.name || 'K').slice(0, 1).toUpperCase()}</div>
        <div>
          <div style="font-weight: 700; font-size: 10.5px; color: #0F172A;">${user.name || 'Kishore R'}</div>
          <div style="font-size: 8.5px; color: #64748B;">${user.email || 'user@email.com'}</div>
        </div>
      </div>
    </div>

    <!-- PRIMARY FINANCIAL METRICS CARDS -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Opening Balance</div>
        <div class="metric-value blue-val">₹${fmt(openingBalance)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Income</div>
        <div class="metric-value green-val">₹${fmt(totalInc)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Expenses</div>
        <div class="metric-value red-val">₹${fmt(totalExp)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Net Savings</div>
        <div class="metric-value blue-val">₹${fmt(netSavings)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Closing Balance</div>
        <div class="metric-value purple-val">₹${fmt(closingBal)}</div>
      </div>
    </div>

    <!-- SECTION: TRANSACTION PASSBOOK -->
    <div class="section-heading">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      Passbook Activity (${sorted.length} Transactions)
    </div>

    <table class="passbook-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Description & Work Statement</th>
          <th>Category</th>
          <th>Payment Method</th>
          <th class="text-right">Expense (₹)</th>
          <th class="text-right">Income (₹)</th>
          <th class="text-right">Balance (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHTML || '<tr><td colspan="7" style="text-align:center;">No transactions found.</td></tr>'}
      </tbody>
    </table>

    <!-- SECTION: ANALYTICS & BREAKDOWNS (FOLLOWING TABLE IMMEDIATELY) -->
    <div class="section-heading">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
      Financial Analytics & Share
    </div>

    <div class="breakdown-row">
      <div class="panel-card">
        <div class="panel-head">Category Spend Distribution</div>
        <div style="display: flex; align-items: center; gap: 14px;">
          ${pieSVG}
          <div style="flex: 1;">
            ${cats.slice(0, 4).map(c => `
              <div style="display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 6px;">
                <span>${c.name}</span>
                <strong>₹${fmt(c.amount)} (${c.pct.toFixed(0)}%)</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-head">Payment Method Share</div>
        ${pms.slice(0, 4).map(p => `
          <div class="pm-item">
            <div class="pm-head">
              <span>${p.name}</span>
              <strong>₹${fmt(p.amount)} (${p.pct.toFixed(0)}%)</strong>
            </div>
            <div class="pm-track"><div class="pm-fill" style="width: ${p.pct}%;"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SECTION: SPENDLY AI AUDIT BANNER -->
    <div class="ai-banner">
      <div class="ai-banner-head">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Spendly AI Financial Audit
      </div>
      <div class="ai-banner-body">${aiText}</div>
    </div>

    <!-- FOOTER -->
    <div class="footer-bar">
      <div>This statement is system generated by Spendly and does not require a physical signature.</div>
      <div><strong>Spendly</strong> • Official Report</div>
    </div>

  </body>
  </html>
  `;
}

// ─────────────────────────────────────────
// Puppeteer PDF Generator
// ─────────────────────────────────────────

async function generatePDF(user, txns, opts = {}) {
  const html = buildHTMLTemplate(user, txns, opts);

  const fs = require('fs');
  const path = require('path');

  console.log("HOME =", process.env.HOME);
  console.log("PUPPETEER_CACHE_DIR =", process.env.PUPPETEER_CACHE_DIR);
  console.log("PUPPETEER_EXECUTABLE_PATH =", process.env.PUPPETEER_EXECUTABLE_PATH);

  try {
    console.log("puppeteer.executablePath() =", puppeteer.executablePath());
  } catch (e) {
    console.error("puppeteer.executablePath() error:", e.message);
  }

  const renderPath = "/opt/render/.cache/puppeteer/chrome/linux-150.0.7871.24/chrome-linux64/chrome";
  console.log("Chrome exists at /opt/render path:", fs.existsSync(renderPath));

  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else if (fs.existsSync(renderPath)) {
      launchOptions.executablePath = renderPath;
    } else {
      // 1. Try default puppeteer executable path
      try {
        const pPath = puppeteer.executablePath();
        if (pPath && typeof pPath === 'string' && fs.existsSync(pPath)) {
          launchOptions.executablePath = pPath;
        }
      } catch {}

      // 2. If not found, search in project & user cache directories
      if (!launchOptions.executablePath) {
        const searchDirs = [
          path.join(__dirname, '..', '..', 'node_modules', '.cache', 'puppeteer'),
          path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'puppeteer'),
          '/opt/render/.cache/puppeteer',
          '/opt/render/project/src/backend/node_modules/.cache/puppeteer',
          '/opt/render/project/src/node_modules/.cache/puppeteer'
        ];

        const findChrome = (dir) => {
          if (!dir || typeof dir !== 'string' || !fs.existsSync(dir)) return null;
          try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
              const fullPath = path.join(dir, file);
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                const found = findChrome(fullPath);
                if (found) return found;
              } else if (file === 'chrome' || file === 'chrome.exe') {
                return fullPath;
              }
            }
          } catch {}
          return null;
        };

        for (const dir of searchDirs) {
          const found = findChrome(dir);
          if (found) {
            console.log("Found Chrome binary via search at:", found);
            launchOptions.executablePath = found;
            break;
          }
        }
      }
    }

    console.log("Launching Puppeteer with executablePath:", launchOptions.executablePath || "default");
    browser = await puppeteer.launch(launchOptions);
  } catch (err) {
    console.error('[pdfGenerator] Puppeteer launch error:', err);
    throw err;
  }





  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


module.exports = { generatePDF };
