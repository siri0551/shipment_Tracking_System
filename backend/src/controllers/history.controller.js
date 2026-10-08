const ShipmentHistory = require("../models/shipmentHistory.model");

// Utility — called internally from other controllers to log history
const logHistory = async ({ shipmentId, trackingId, action, performedBy, changes, previousValue, newValue, blockchainTxHash, ipAddress }) => {
  try {
    await ShipmentHistory.create({
      shipment: shipmentId,
      trackingId,
      action,
      performedBy,
      changes,
      previousValue,
      newValue,
      blockchainTxHash: blockchainTxHash || null,
      ipAddress: ipAddress || null,
    });
  } catch (err) {
    console.error("History log error:", err.message);
  }
};

// GET /api/history/:trackingId — Full immutable history for a shipment (public)
const getHistory = async (req, res) => {
  try {
    const history = await ShipmentHistory.find({ trackingId: req.params.trackingId })
      .populate("performedBy", "name email role")
      .sort({ createdAt: 1 });

    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/history/shipment/:id — History by shipment ObjectId (authenticated)
const getHistoryById = async (req, res) => {
  try {
    const history = await ShipmentHistory.find({ shipment: req.params.id })
      .populate("performedBy", "name email role")
      .sort({ createdAt: 1 });

    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/history/shipment/:id/blockchain — Only blockchain-recorded events
const getBlockchainHistory = async (req, res) => {
  try {
    const history = await ShipmentHistory.find({
      shipment: req.params.id,
      blockchainTxHash: { $ne: null },
    })
      .populate("performedBy", "name email role")
      .sort({ createdAt: 1 });

    res.json({ success: true, count: history.length, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { logHistory, getHistory, getHistoryById, getBlockchainHistory };
