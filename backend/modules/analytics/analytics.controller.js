const analyticsService = require('./analytics.service');

const getOrdersPerDay = async (req, res) => {
  try {
    const data = await analyticsService.getOrdersPerDay(Number(req.query.days) || 7);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders per day' });
  }
};

const getRevenuePerStore = async (req, res) => {
  try {
    const data = await analyticsService.getRevenuePerStore();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue per store' });
  }
};

const getTopItems = async (req, res) => {
  try {
    const data = await analyticsService.getTopItems(Number(req.query.limit) || 5);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
};

const getOverview = async (req, res) => {
  try {
    const data = await analyticsService.getOverviewStats();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
};

module.exports = { getOrdersPerDay, getRevenuePerStore, getTopItems, getOverview };
