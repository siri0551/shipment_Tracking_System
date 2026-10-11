const express = require("express");
const router = express.Router();
const { verifyIntegrity, batchVerify, getFlaggedShipments } = require("../controllers/tamper.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/verify/:trackingId", verifyIntegrity);                         // public

router.use(protect);
router.get("/batch", authorize("Admin"), batchVerify);
router.get("/flagged", authorize("Admin"), getFlaggedShipments);

module.exports = router;
