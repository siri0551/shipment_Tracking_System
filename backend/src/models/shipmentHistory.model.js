const mongoose = require("mongoose");

const shipmentHistorySchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true },
    trackingId: { type: String, required: true },
    action: {
      type: String,
      enum: ["Created", "Updated", "Status Changed", "Carrier Assigned", "Ownership Transferred", "Delivered", "Cancelled", "Blockchain Registered", "Verified"],
      required: true,
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changes: { type: mongoose.Schema.Types.Mixed },   // what changed
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    blockchainTxHash: { type: String, default: null },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

// Immutable — no updates or deletes allowed
shipmentHistorySchema.pre(["updateOne", "findOneAndUpdate", "deleteOne", "findOneAndDelete"], function () {
  throw new Error("Shipment history is immutable and cannot be modified or deleted");
});

module.exports = mongoose.model("ShipmentHistory", shipmentHistorySchema);
