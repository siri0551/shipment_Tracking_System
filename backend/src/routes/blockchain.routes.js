const express = require("express");
const router = express.Router();
const {
  registerOnChain,
  updateStatus,
  transferOwnership,
  confirmDelivery,
  cancelShipment,
  getEvents,
  verifyShipment,
} = require("../controllers/blockchain.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/verify/:trackingId", verifyShipment); // public

router.use(protect);

router.post("/register/:id", authorize("Admin", "Manufacturer"), registerOnChain);
router.put("/status/:id", authorize("Admin", "Carrier", "Manufacturer"), updateStatus);
router.put("/transfer/:id", authorize("Admin", "Carrier"), transferOwnership);
router.put("/confirm-delivery/:id", authorize("Admin", "Carrier", "Distributor"), confirmDelivery);
router.delete("/cancel/:id", authorize("Admin", "Manufacturer"), cancelShipment);
router.get("/events/:id", getEvents);

module.exports = router;
