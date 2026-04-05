'use strict';

const { getSummaryStats, getTopProductsStats } = require('../models/reportModel');

// ── GET /api/reports/summary ───────────────────────────────────
async function getSummary(req, res) {
    try {
        const stats = await getSummaryStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (err) {
        console.error('[getSummary]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch summary reports.' });
    }
}

// ── GET /api/reports/top-products ──────────────────────────────
async function getTopProducts(req, res) {
    try {
        const topProducts = await getTopProductsStats();
        return res.status(200).json({ success: true, data: topProducts });
    } catch (err) {
        console.error('[getTopProducts]', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch top products.' });
    }
}

module.exports = {
    getSummary,
    getTopProducts
};
