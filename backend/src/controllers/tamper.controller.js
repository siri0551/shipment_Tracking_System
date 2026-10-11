const Shipment = require("../models/shipment.model");
const ShipmentHistory = require("../models/shipmentHistory.model");
const { getShipmentOnChain, getShipmentEventsOnChain } = require("../config/blockchain");
const { logHistory } = require("./history.controller");

const STATUS_MAP = {
  Created: 0, "Picked Up": 1, "In Transit": 2,
  Warehouse: 3, "Out for Delivery": 4, Delivered: 5, Cancelled: 6,
};

// GET /api/tamper/verify/:trackingId — Full tamper check: MongoDB vs Blockchain
const verifyIntegrity = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const onChain = await getShipmentOnChain(shipment.trackingId);
    const onChainEvents = await getShipmentEventsOnChain(shipment.contractShipmentId);

    const mismatches = [];

    // Check trackingId match
    if (onChain.trackingId !== shipment.trackingId)
      mismatches.push({ field: "trackingId", offChain: shipment.trackingId, onChain: onChain.trackingId });

    // Check status match
    if (onChain.status !== shipment.status)
      mismatches.push({ field: "status", offChain: shipment.status, onChain: onChain.status });

    // Check event count vs statusHistory count
    const offChainEventCount = shipment.statusHistory.length;
    const onChainEventCount = onChainEvents.length;
    if (offChainEventCount !== onChainEventCount)
      mismatches.push({ field: "eventCount", offChain: offChainEventCount, onChain: onChainEventCount });

    const isTampered = mismatches.length > 0;

    // Log verification attempt in history
    await logHistory({
      shipmentId: shipment._id,
      trackingId: shipment.trackingId,
      action: "Verified",
      performedBy: req.user?._id || null,
      newValue: { isTampered, mismatches },
      ipAddress: req.ip,
    });

    // Flag shipment if tampered
    if (isTampered) {
      shipment.isVerified = false;
      await shipment.save();
    } else {
      shipment.isVerified = true;
      await shipment.save();
    }

    res.json({
      success: true,
      trackingId: shipment.trackingId,
      isTampered,
      mismatches,
      offChain: {
        trackingId: shipment.trackingId,
        status: shipment.status,
        eventCount: offChainEventCount,
      },
      onChain: {
        trackingId: onChain.trackingId,
        status: onChain.status,
        eventCount: onChainEventCount,
        events: onChainEvents,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tamper/batch — Verify all unverified shipments (Admin)
const batchVerify = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      contractShipmentId: { $ne: null },
      isVerified: false,
      status: { $nin: ["Cancelled"] },
    }).select("trackingId contractShipmentId status statusHistory");

    const results = [];

    for (const shipment of shipments) {
      try {
        const onChain = await getShipmentOnChain(shipment.trackingId);
        const isTampered = onChain.status !== shipment.status || onChain.trackingId !== shipment.trackingId;

        shipment.isVerified = !isTampered;
        await shipment.save();

        results.push({ trackingId: shipment.trackingId, isTampered });
      } catch {
        results.push({ trackingId: shipment.trackingId, error: "Blockchain lookup failed" });
      }
    }

    const tampered = results.filter((r) => r.isTampered);
    res.json({ success: true, total: results.length, tampered: tampered.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tamper/flagged — Get all flagged/tampered shipments (Admin)
const getFlaggedShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({
      isVerified: false,
      contractShipmentId: { $ne: null },
    })
      .populate("sender", "name email")
      .populate("carrier", "name email")
      .select("trackingId status isVerified contractShipmentId createdAt");

    res.json({ success: true, count: shipments.length, shipments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { verifyIntegrity, batchVerify, getFlaggedShipments };
