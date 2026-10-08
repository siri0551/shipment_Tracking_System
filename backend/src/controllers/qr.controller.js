const QRCode = require("qrcode");
const Shipment = require("../models/shipment.model");

const generateQRData = (shipment) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return JSON.stringify({
    trackingId: shipment.trackingId,
    trackingUrl: `${baseUrl}/track/${shipment.trackingId}`,
    product: shipment.product.name,
    from: `${shipment.source.city}, ${shipment.source.country}`,
    to: `${shipment.destination.city}, ${shipment.destination.country}`,
  });
};

// POST /api/qr/generate/:id — Generate & save QR for a shipment
const generateQR = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    const qrDataUrl = await QRCode.toDataURL(generateQRData(shipment), {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
    });

    shipment.qrCode = qrDataUrl;
    await shipment.save();

    res.json({ success: true, trackingId: shipment.trackingId, qrCode: qrDataUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/qr/:trackingId — Get QR code for a shipment (public)
const getQR = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId }).select("trackingId qrCode");
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    if (!shipment.qrCode) {
      // Auto-generate if not yet created
      const qrDataUrl = await QRCode.toDataURL(generateQRData(shipment), {
        errorCorrectionLevel: "H",
        width: 300,
        margin: 2,
      });
      shipment.qrCode = qrDataUrl;
      await shipment.save();
    }

    res.json({ success: true, trackingId: shipment.trackingId, qrCode: shipment.qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/qr/:trackingId/image — Stream QR as PNG image
const getQRImage = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    res.setHeader("Content-Type", "image/png");
    await QRCode.toFileStream(res, generateQRData(shipment), {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateQR, getQR, getQRImage };
