/**
 * PDF Controller
 * Handles authenticated PDF generation requests.
 * POST /api/pdf/generate
 */

const mongoose = require('mongoose');
const Expense  = require('../models/Expense');
const User     = require('../models/User');
const { generatePDF } = require('../services/pdfGenerator');
const logger   = require('../utils/logger');

exports.generatePdf = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Destructure + sanitize all filter params ────────────────
    const {
      startDate,
      endDate,
      dataType            = 'expenses',   // 'expenses' | 'income' | 'transactions'
      categories          = [],
      payments            = [],
      minAmount,
      maxAmount,
      sortOrder           = 'desc',
      paperSize           = 'A4',
      orientation         = 'Portrait',
      marginSize          = 'Normal',
      includeCharts       = true,
      includeSummaryPage  = true,
      includeNotes        = true,
      includeCategoryBreakdown = true,
      includePaymentSummary    = true,
    } = req.body;

    // ── Validate required fields ────────────────────────────────
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'startDate must be before endDate',
      });
    }

    // ── Build MongoDB match query ────────────────────────────────
    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: start, $lte: end },
    };

    // Data type filter
    if (dataType === 'expenses') {
      matchQuery.type = { $ne: 'income' };
    } else if (dataType === 'income') {
      matchQuery.type = 'income';
    }
    // 'transactions' = all types → no additional filter

    // Category filter
    if (Array.isArray(categories) && categories.length > 0) {
      matchQuery.category = { $in: categories };
    }

    // Payment method filter
    if (Array.isArray(payments) && payments.length > 0) {
      matchQuery.paymentMethod = { $in: payments };
    }

    // Amount range filter
    if (minAmount !== undefined && minAmount !== null && minAmount !== '') {
      matchQuery.amount = matchQuery.amount || {};
      matchQuery.amount.$gte = parseFloat(minAmount);
    }
    if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') {
      matchQuery.amount = matchQuery.amount || {};
      matchQuery.amount.$lte = parseFloat(maxAmount);
    }

    // ── Fetch user ───────────────────────────────────────────────
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ── Calculate Opening Balance from prior transactions ────────
    const priorSummary = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $lt: start }
        }
      },
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $ne: ["$type", "income"] }, "$amount", 0]
            }
          }
        }
      }
    ]);

    const openingBalance = priorSummary.length > 0 ? (priorSummary[0].income - priorSummary[0].expense) : 0;

    // ── Fetch transactions ───────────────────────────────────────
    const transactions = await Expense
      .find(matchQuery)
      .sort({ date: sortOrder === 'asc' ? 1 : -1 })
      .lean();

    logger.info(`PDF report: user=${userId}, txns=${transactions.length}, range=${startDate}–${endDate}`);

    // ── Generate PDF ─────────────────────────────────────────────
    const pdfBuffer = await generatePDF(user, transactions, {
      startDate: start,
      endDate:   end,
      openingBalance,
      dataType,
      paperSize,
      orientation,
      marginSize,
      includeCharts,
      includeSummaryPage,
      includeNotes,
      includeCategoryBreakdown,
      includePaymentSummary,
      sortOrder,
    });

    // ── Build filename ───────────────────────────────────────────
    const safeName = (user.name || 'user').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateTag  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `spendly_${safeName}_${dateTag}.pdf`;

    // ── Stream response ─────────────────────────────────────────
    const bufferToSend = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      bufferToSend.length,
      'Cache-Control':       'no-cache, no-store, must-revalidate',
    });

    return res.end(bufferToSend);
  } catch (err) {
    logger.error(`PDF generation error: ${err.message}`, err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate PDF. Please try again.',
      error: err.message,
    });
  }
};

