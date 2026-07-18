const {
  getAdminDashboardStats,
  getRoleDashboardStats,
} = require('../utils/dashboardStats');

async function getAdminStats(req, res, next) {
  try {
    const stats = await getAdminDashboardStats();
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const payload = await getRoleDashboardStats(req.user);
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAdminStats,
  getStats,
};
