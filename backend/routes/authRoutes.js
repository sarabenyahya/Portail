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

// Ajouter cette route pour vérifier les utilisateurs (à protéger en production)
router.get("/debug-users", async (req, res) => {
  try {
    // Récupérer tous les employés
    const employees = await Employee.find().select(
      "_id email firstName lastName password"
    );

    // Créer une version sécurisée pour l'affichage
    const safeEmployees = employees.map((emp) => ({
      _id: emp._id,
      email: emp.email,
      name: `${emp.firstName} ${emp.lastName}`,
      hasPassword: emp.password ? true : false,
      passwordLength: emp.password ? emp.password.length : 0,
    }));

    res.json({
      totalEmployees: employees.length,
      employees: safeEmployees,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
