const express = require("express");
const router = express.Router();
const { generateQR, getQR, getQRImage } = require("../controllers/qr.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/:trackingId", getQR);             // public
router.get("/:trackingId/image", getQRImage);  // public

router.use(protect);
router.post("/generate/:id", authorize("Admin", "Manufacturer"), generateQR);

module.exports = router;
