const mongoose = require("mongoose");

const STATUSES = ["Created", "Picked Up", "In Transit", "Warehouse", "Out for Delivery", "Delivered", "Cancelled"];

const trackingEventSchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true },
    trackingId: { type: String, required: true },
    status: { type: String, enum: STATUSES, required: true },
    location: {
      address: { type: String },
      city: { type: String },
      country: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    blockchainTxHash: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrackingEvent", trackingEventSchema);
