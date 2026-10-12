const express = require("express");
const router = express.Router();
const { getOverview, getByStatus, getByCountry, getCarrierPerformance, getDailyTrend, getTopRoutes } = require("../controllers/analytics.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect, authorize("Admin"));

router.get("/overview", getOverview);
router.get("/by-status", getByStatus);
router.get("/by-country", getByCountry);
router.get("/carrier-performance", getCarrierPerformance);
router.get("/daily", getDailyTrend);
router.get("/top-routes", getTopRoutes);

module.exports = router;
