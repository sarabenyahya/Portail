const express = require("express");
const router = express.Router();
const demandsController = require("../controllers/demandsController");
const auth = require("../middleware/auth");

// Protéger toutes les routes avec l'authentification
router.use(auth);

// Routes pour les demandes
router.post("/", demandsController.createDemand);
router.get("/", demandsController.getAllDemands);
router.delete("/:id", demandsController.deleteDemand);

module.exports = router;
