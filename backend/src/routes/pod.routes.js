const express = require("express");
const router = express.Router();
const { generateOTP, verifyOTP, submitProof, getProof } = require("../controllers/pod.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const upload = require("../config/multer");

router.get("/:trackingId", getProof); // public

router.use(protect);
router.post("/generate-otp/:id", authorize("Admin", "Carrier"), generateOTP);
router.post("/verify-otp/:id", authorize("Admin", "Carrier", "Customer"), verifyOTP);
router.post("/submit/:id", authorize("Admin", "Carrier"), upload.single("deliveryPhoto"), submitProof);

module.exports = router;
