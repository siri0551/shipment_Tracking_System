const express = require("express");
const router = express.Router();
const { getHistory, getHistoryById, getBlockchainHistory } = require("../controllers/history.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/:trackingId", getHistory);                               // public

router.use(protect);
router.get("/shipment/:id", getHistoryById);
router.get("/shipment/:id/blockchain", getBlockchainHistory);

module.exports = router;
