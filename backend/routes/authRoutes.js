const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const AuthController = require("../controllers/authController");

router.get("/me", async (req, res) => {
  try {
    const employee = await Employee.findById(req.session.employeeId);
    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", AuthController.loginUser);
router.post("/logout", AuthController.logoutUser);
router.post("/register", AuthController.registerUser);
router.get("/check-session", AuthController.checkSession);

module.exports = router;
