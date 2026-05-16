const archiveService = require('./archive.service');

const archiveOldOrders = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const result = await archiveService.archiveOldOrders(days);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to archive orders' });
  }
};

const getArchivedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, storeId } = req.query;
    const result = await archiveService.getArchivedOrders(Number(page), Number(limit), storeId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch archived orders' });
  }
};

module.exports = { archiveOldOrders, getArchivedOrders };
