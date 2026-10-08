const express = require("express");
const router = express.Router();
const { addTrackingUpdate, getTrackingTimeline, getCurrentStatus, getShipmentsByStatus } = require("../controllers/tracking.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/:trackingId", getTrackingTimeline);           // public
router.get("/:trackingId/current", getCurrentStatus);      // public

router.use(protect);

router.post("/:id/update", authorize("Admin", "Carrier", "Warehouse", "Distributor"), addTrackingUpdate);
router.get("/status/:status", authorize("Admin"), getShipmentsByStatus);

module.exports = router;
