const express = require("express");
const router = express.Router();
const {
  createShipment,
  getShipments,
  getShipment,
  trackShipment,
  updateShipment,
  assignCarrier,
  cancelShipment,
} = require("../controllers/shipment.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/track/:trackingId", trackShipment); // public

router.use(protect); // all below require auth

router.post("/", authorize("Admin", "Manufacturer"), createShipment);
router.get("/", getShipments);
router.get("/:id", getShipment);
router.put("/:id", authorize("Admin", "Manufacturer"), updateShipment);
router.put("/:id/assign-carrier", authorize("Admin"), assignCarrier);
router.delete("/:id", authorize("Admin"), cancelShipment);

module.exports = router;
