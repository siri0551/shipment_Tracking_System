const Shipment = require("../models/shipment.model");
const {
  registerShipmentOnChain,
  updateStatusOnChain,
  transferOwnershipOnChain,
  confirmDeliveryOnChain,
  cancelShipmentOnChain,
  getShipmentEventsOnChain,
  getShipmentOnChain,
} = require("../config/blockchain");

// POST /api/blockchain/register/:id — Register existing shipment on blockchain
const registerOnChain = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("carrier", "walletAddress")
      .populate("sender", "walletAddress");

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Already on blockchain" });

    const carrierWallet = shipment.carrier?.walletAddress || null;
    const { txHash, contractShipmentId } = await registerShipmentOnChain(
      shipment.trackingId,
      carrierWallet,
      null
    );

    shipment.blockchainTxHash = txHash;
    shipment.contractShipmentId = contractShipmentId;
    await shipment.save();

    res.json({ success: true, txHash, contractShipmentId, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/blockchain/status/:id — Update status on blockchain + MongoDB
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const { txHash } = await updateStatusOnChain(shipment.contractShipmentId, status, note || "");

    shipment.status = status;
    shipment.blockchainTxHash = txHash;
    await shipment.save();

    res.json({ success: true, txHash, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/blockchain/transfer/:id — Transfer carrier ownership on blockchain
const transferOwnership = async (req, res) => {
  try {
    const { newCarrierWallet, newCarrierId } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const { txHash } = await transferOwnershipOnChain(shipment.contractShipmentId, newCarrierWallet);

    shipment.carrier = newCarrierId;
    shipment.blockchainTxHash = txHash;
    await shipment.save();

    res.json({ success: true, txHash, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/blockchain/confirm-delivery/:id — Confirm delivery on blockchain
const confirmDelivery = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const { txHash } = await confirmDeliveryOnChain(shipment.contractShipmentId);

    shipment.status = "Delivered";
    shipment.actualDelivery = new Date();
    shipment.blockchainTxHash = txHash;
    await shipment.save();

    res.json({ success: true, txHash, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/blockchain/cancel/:id — Cancel shipment on blockchain
const cancelShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const { txHash } = await cancelShipmentOnChain(shipment.contractShipmentId);

    shipment.status = "Cancelled";
    shipment.blockchainTxHash = txHash;
    await shipment.save();

    res.json({ success: true, txHash, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blockchain/events/:id — Get on-chain events for a shipment
const getEvents = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const events = await getShipmentEventsOnChain(shipment.contractShipmentId);
    res.json({ success: true, contractShipmentId: shipment.contractShipmentId, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blockchain/verify/:trackingId — Verify shipment on-chain vs MongoDB
const verifyShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (!shipment.contractShipmentId) return res.status(400).json({ success: false, message: "Shipment not on blockchain yet" });

    const onChain = await getShipmentOnChain(req.params.trackingId);

    const isMatch = onChain.trackingId === shipment.trackingId && onChain.status === shipment.status;

    res.json({ success: true, isMatch, onChain, offChain: { trackingId: shipment.trackingId, status: shipment.status } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerOnChain, updateStatus, transferOwnership, confirmDelivery, cancelShipment, getEvents, verifyShipment };
