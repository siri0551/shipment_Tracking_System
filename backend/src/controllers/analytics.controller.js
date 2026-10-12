const Shipment = require("../models/shipment.model");
const User = require("../models/user.model");
const TrackingEvent = require("../models/trackingEvent.model");

// GET /api/analytics/overview — Total counts summary
const getOverview = async (req, res) => {
  try {
    const [total, delivered, cancelled, inTransit, delayed, totalUsers] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: "Delivered" }),
      Shipment.countDocuments({ status: "Cancelled" }),
      Shipment.countDocuments({ status: "In Transit" }),
      Shipment.countDocuments({
        status: { $nin: ["Delivered", "Cancelled"] },
        estimatedDelivery: { $lt: new Date() },
      }),
      User.countDocuments(),
    ]);

    const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      overview: { total, delivered, cancelled, inTransit, delayed, totalUsers, deliveryRate: `${deliveryRate}%` },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/by-status — Shipment count grouped by status
const getByStatus = async (req, res) => {
  try {
    const data = await Shipment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/by-country — Shipments grouped by destination country
const getByCountry = async (req, res) => {
  try {
    const data = await Shipment.aggregate([
      { $group: { _id: "$destination.country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/carrier-performance — Per carrier stats
const getCarrierPerformance = async (req, res) => {
  try {
    const data = await Shipment.aggregate([
      { $match: { carrier: { $ne: null } } },
      {
        $group: {
          _id: "$carrier",
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
          delayed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $nin: ["$status", ["Delivered", "Cancelled"]] },
                    { $lt: ["$estimatedDelivery", new Date()] },
                  ],
                },
                1, 0,
              ],
            },
          },
        },
      },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "carrier" },
      },
      { $unwind: { path: "$carrier", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          carrierName: "$carrier.name",
          carrierEmail: "$carrier.email",
          total: 1, delivered: 1, cancelled: 1, delayed: 1,
          successRate: {
            $cond: [{ $gt: ["$total", 0] },
              { $multiply: [{ $divide: ["$delivered", "$total"] }, 100] }, 0],
          },
        },
      },
      { $sort: { successRate: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/daily?days=30 — Daily shipment trend
const getDailyTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const data = await Shipment.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, days, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/top-routes — Top source → destination routes
const getTopRoutes = async (req, res) => {
  try {
    const data = await Shipment.aggregate([
      {
        $group: {
          _id: { from: "$source.city", to: "$destination.city" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { from: "$_id.from", to: "$_id.to", count: 1, _id: 0 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOverview, getByStatus, getByCountry, getCarrierPerformance, getDailyTrend, getTopRoutes };
