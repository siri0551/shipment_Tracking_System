const express = require("express");
const router = express.Router();
const { register, login, getMe, getAllUsers, updateUserRole, toggleUserStatus } = require("../controllers/auth.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, authorize("Admin"), getAllUsers);
router.put("/users/:id/role", protect, authorize("Admin"), updateUserRole);
router.put("/users/:id/status", protect, authorize("Admin"), toggleUserStatus);

module.exports = router;
