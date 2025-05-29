const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

router.post("/login", AuthController.loginUser);
router.post("/logout", AuthController.logoutUser);
router.post("/register", AuthController.registerUser);
router.get("/check-session", AuthController.checkSession);
module.exports = router;
