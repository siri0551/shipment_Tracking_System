const crypto = require("crypto");
const fs = require("fs");
const Shipment = require("../models/shipment.model");
const ProofOfDelivery = require("../models/proofOfDelivery.model");
const { logHistory } = require("./history.controller");
const { uploadImage } = require("../config/cloudinary");

// POST /api/pod/generate-otp/:id — Generate OTP for delivery verification
const generateOTP = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    if (shipment.status === "Delivered") return res.status(400).json({ success: false, message: "Already delivered" });
    if (shipment.status !== "Out for Delivery") return res.status(400).json({ success: false, message: "Shipment must be Out for Delivery" });

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let pod = await ProofOfDelivery.findOne({ shipment: shipment._id });
    if (!pod) {
      pod = await ProofOfDelivery.create({ shipment: shipment._id, trackingId: shipment.trackingId, otp, otpExpiresAt });
    } else {
      pod.otp = otp;
      pod.otpExpiresAt = otpExpiresAt;
      pod.otpVerified = false;
      await pod.save();
    }

    // In production send OTP via SMS/email — returning here for dev
    res.json({ success: true, message: "OTP generated", otp, expiresAt: otpExpiresAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/pod/verify-otp/:id — Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    const pod = await ProofOfDelivery.findOne({ shipment: shipment._id });
    if (!pod || !pod.otp) return res.status(400).json({ success: false, message: "No OTP found, generate one first" });
    if (pod.otpVerified) return res.status(400).json({ success: false, message: "OTP already verified" });
    if (new Date() > pod.otpExpiresAt) return res.status(400).json({ success: false, message: "OTP expired" });
    if (pod.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

    pod.otpVerified = true;
    pod.otp = null;
    await pod.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/pod/submit/:id — Submit full proof of delivery
const submitProof = async (req, res) => {
  try {
    const { digitalSignature, receiverName, receiverNote } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    const pod = await ProofOfDelivery.findOne({ shipment: shipment._id });
    if (!pod) return res.status(400).json({ success: false, message: "No proof of delivery record found" });
    if (!pod.otpVerified) return res.status(400).json({ success: false, message: "OTP must be verified first" });

    // Upload delivery photo if provided
    let deliveryPhotoUrl = null;
    if (req.file) {
      deliveryPhotoUrl = await uploadImage(req.file.path);
      fs.unlinkSync(req.file.path); // remove local file after upload
    }

    pod.digitalSignature = digitalSignature || null;
    pod.deliveryPhoto = deliveryPhotoUrl;
    pod.receiverName = receiverName;
    pod.receiverNote = receiverNote;
    pod.verifiedBy = req.user._id;
    pod.verifiedAt = new Date();
    pod.isCompleted = true;
    await pod.save();

    // Mark shipment as delivered
    shipment.status = "Delivered";
    shipment.actualDelivery = new Date();
    shipment.isVerified = true;
    await shipment.save();

    await logHistory({
      shipmentId: shipment._id,
      trackingId: shipment.trackingId,
      action: "Delivered",
      performedBy: req.user._id,
      newValue: { status: "Delivered", proofOfDelivery: pod._id },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: "Proof of delivery submitted", pod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/pod/:trackingId — Get proof of delivery record
const getProof = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingId: req.params.trackingId });
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    const pod = await ProofOfDelivery.findOne({ shipment: shipment._id })
      .populate("verifiedBy", "name email role");

    if (!pod) return res.status(404).json({ success: false, message: "No proof of delivery found" });

    res.json({ success: true, pod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateOTP, verifyOTP, submitProof, getProof };
