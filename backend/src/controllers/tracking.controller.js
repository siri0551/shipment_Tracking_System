const Shipment = require("../models/shipment.model");
const TrackingEvent = require("../models/trackingEvent.model");

const STATUS_ORDER = ["Created", "Picked Up", "In Transit", "Warehouse", "Out for Delivery", "Delivered"];

// POST /api/tracking/:id/update — Add a new tracking status + location
const addTrackingUpdate = async (req, res) => {
  try {
    const { status, location, note } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    if (shipment.status === "Delivered" || shipment.status === "Cancelled")
      return res.status(400).json({ success: false, message: `Shipment already ${shipment.status}` });

    // Validate status progression
    const currentIndex = STATUS_ORDER.indexOf(shipment.status);
    const newIndex = STATUS_ORDER.indexOf(status);
    if (newIndex !== -1 && newIndex < currentIndex)
      return res.status(400).json({ success: false, message: "Cannot move to a previous status" });

    // Create tracking event
    const event = await TrackingEvent.create({
      shipment: shipment._id,
      trackingId: shipment.trackingId,
      status,
      location,
      note,
      updatedBy: req.user._id,
    });

    // Update shipment status + location + history
    shipment.status = status;
    shipment.currentLocation = location;
    shipment.statusHistory.push({ status, note, location: location?.city, timestamp: new Date() });
    if (status === "Delivered") shipment.actualDelivery = new Date();
    await shipment.save();

    // Emit real-time update via socket.io
    const io = req.app.get("io");
    if (io) io.to(shipment.trackingId).emit("trackingUpdate", { status, location, note, timestamp: new Date() });

    res.status(201).json({ success: true, event, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tracking/:trackingId — Get full tracking timeline
const getTrackingTimeline = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId })
      .populate("sender", "name")
      .populate("carrier", "name");

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    const events = await TrackingEvent.find({ trackingId: req.params.trackingId })
      .populate("updatedBy", "name role")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      trackingId: shipment.trackingId,
      currentStatus: shipment.status,
      currentLocation: shipment.currentLocation,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      timeline: events,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tracking/:trackingId/current — Get current status + location only
const getCurrentStatus = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId }).select(
      "trackingId status currentLocation estimatedDelivery actualDelivery"
    );

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tracking/status/:status — Get all shipments by status (Admin)
const getShipmentsByStatus = async (req, res) => {
  try {
    const shipments = await Shipment.find({ status: req.params.status })
      .populate("sender", "name email")
      .populate("carrier", "name email")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: shipments.length, shipments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addTrackingUpdate, getTrackingTimeline, getCurrentStatus, getShipmentsByStatus };
