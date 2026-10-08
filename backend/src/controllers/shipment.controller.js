const Shipment = require("../models/shipment.model");
const { logHistory } = require("./history.controller");

// POST /api/shipments — Create shipment (Manufacturer, Admin)
const createShipment = async (req, res) => {
  try {
    const shipment = await Shipment.create({ ...req.body, sender: req.user._id });

    await logHistory({
      shipmentId: shipment._id,
      trackingId: shipment.trackingId,
      action: "Created",
      performedBy: req.user._id,
      newValue: { status: shipment.status },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shipments — Get all shipments (Admin sees all, others see their own)
const getShipments = async (req, res) => {
  try {
    const filter =
      req.user.role === "Admin"
        ? {}
        : req.user.role === "Carrier"
        ? { carrier: req.user._id }
        : { sender: req.user._id };

    const shipments = await Shipment.find(filter)
      .populate("sender", "name email role")
      .populate("carrier", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: shipments.length, shipments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shipments/:id — Get single shipment
const getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("sender", "name email role")
      .populate("carrier", "name email role");

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/shipments/track/:trackingId — Public tracking by trackingId
const trackShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId })
      .populate("sender", "name")
      .populate("carrier", "name");

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/shipments/:id — Update shipment (Admin, Manufacturer)
const updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    if (shipment.status === "Delivered" || shipment.status === "Cancelled")
      return res.status(400).json({ success: false, message: `Cannot update a ${shipment.status} shipment` });

    const updated = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, shipment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/shipments/:id/assign-carrier — Assign carrier (Admin)
const assignCarrier = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { carrier: req.body.carrierId },
      { new: true }
    ).populate("carrier", "name email role");

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/shipments/:id — Cancel shipment (Admin only)
const cancelShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    if (shipment.status === "Delivered")
      return res.status(400).json({ success: false, message: "Cannot cancel a delivered shipment" });

    shipment.status = "Cancelled";
    await shipment.save();

    res.json({ success: true, message: "Shipment cancelled", shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createShipment, getShipments, getShipment, trackShipment, updateShipment, assignCarrier, cancelShipment };
