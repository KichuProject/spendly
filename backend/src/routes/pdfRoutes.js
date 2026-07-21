/**
 * PDF Routes
 * All endpoints require authentication
 */

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { generatePdf } = require('../controllers/pdfController');

// All PDF routes require authentication
router.use(authMiddleware);

/**
 * POST /api/pdf/generate
 * Generate and stream a PDF report for the authenticated user
 * Body: { startDate, endDate, dataType, categories, payments, minAmount, maxAmount,
 *         sortOrder, paperSize, orientation, marginSize, includeCharts,
 *         includeSummaryPage, includeNotes, includeCategoryBreakdown, includePaymentSummary }
 */
router.post('/generate', generatePdf);

module.exports = router;
