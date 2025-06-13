const express = require("express");
const router = express.Router();
const demandsController = require("../controllers/demandsController");
const auth = require("../middleware/auth");
const Demands = require("../models/Demand"); // Ajout de l'import du modèle Demands

// Protéger toutes les routes avec l'authentification
router.use(auth);

// Routes pour les demandes
router.post("/", demandsController.createDemand);
router.get("/", demandsController.getAllDemands);
router.delete("/:id", demandsController.deleteDemand);
router.put("/:id", demandsController.updateDemand);
router.get("/:id/download", demandsController.downloadPdf);

// Route pour récupérer les demandes par ID d'employé
router.get("/employee/:employeeId", async (req, res) => {
  try {
    // Vérifier que l'employé est authentifié
    if (!req.session.employeeId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const { employeeId } = req.params;
    console.log(`Récupération des demandes pour l'employé ID: ${employeeId}`);

    // Vérifier si l'ID est valide
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "ID d'employé invalide" });
    }

    // Récupérer les demandes de l'employé spécifié
    const demands = await Demands.find({
      employee: employeeId,
    }).populate("employee", "firstName lastName email");

    console.log(
      `${demands.length} demandes trouvées pour l'employé ${employeeId}`
    );

    // Formater les demandes pour le frontend
    const formattedDemands = demands.map((demand) => ({
      id: demand._id,
      type: demand.type,
      status: demand.status || "PENDING",
      createdAt: demand.createdAt,
      updatedAt: demand.updatedAt,
      startDate: demand.startDate,
      endDate: demand.endDate,
      reason: demand.reason,
      employeeId: demand.employee._id,
      employeeName: `${demand.employee.firstName} ${demand.employee.lastName}`,
      employeeEmail: demand.employee.email,
    }));

    res.json(formattedDemands);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des demandes pour l'employé: ${error}`
    );
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
