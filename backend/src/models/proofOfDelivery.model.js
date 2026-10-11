const mongoose = require("mongoose");

const proofOfDeliverySchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true },
    trackingId: { type: String, required: true },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
    digitalSignature: { type: String, default: null },
    deliveryPhoto: { type: String, default: null },  // cloudinary URL
    receiverName: { type: String },
    receiverNote: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date, default: null },
    blockchainTxHash: { type: String, default: null },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProofOfDelivery", proofOfDeliverySchema);
