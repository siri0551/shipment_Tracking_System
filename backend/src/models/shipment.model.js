const mongoose = require("mongoose");

const STATUSES = ["Created", "Picked Up", "In Transit", "Warehouse", "Out for Delivery", "Delivered", "Cancelled"];

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true },
    product: {
      name: { type: String, required: true },
      description: { type: String },
      quantity: { type: Number, required: true },
      weight: { type: Number },
      category: { type: String },
    },
    source: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    destination: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    carrier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: STATUSES, default: "Created" },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    blockchainTxHash: { type: String, default: null },
    contractShipmentId: { type: Number, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate trackingId before save
shipmentSchema.pre("save", function (next) {
  if (!this.trackingId) {
    this.trackingId = "SHP-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Shipment", shipmentSchema);
