const Demands = require("../models/Demand");
const pdfService = require("../services/pdfService");
const Employee = require("../models/Employee");

// Créer une nouvelle demande
exports.createDemand = async (req, res) => {
  try {
    console.log("Creating demand...");
    const { type, dateDebut, dateFin } = req.body;
    const demand = new Demands({
      employee: req.session.employeeId,
      type,
      dateDebut: type === "CONGE" ? dateDebut : null,
      dateFin: type === "CONGE" ? dateFin : null,
    });

    const savedDemand = await demand.save();
    res.status(201).json(savedDemand);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Récupérer toutes les demandes de l'employé connecté
exports.getAllDemands = async (req, res) => {
  try {
    const demands = await Demands.find({
      employee: req.session.employeeId,
    }).sort({ createdAt: -1 });
    res.json(demands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une demande par ID
exports.getDemandById = async (req, res) => {
  try {
    const demand = await Demands.findById(req.params.id).populate(
      "employee",
      "firstName lastName email"
    );
    if (!demand) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    res.json(demand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les demandes
exports.getAllDemands = async (req, res) => {
  try {
    const demands = await Demands.find().populate(
      "employee",
      "firstName lastName email"
    );
    res.json(demands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une demande
exports.updateDemand = async (req, res) => {
  try {
    const demand = await Demands.findById(req.params.id);
    if (!demand) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    Object.assign(demand, req.body);
    demand.updatedAt = Date.now();

    const updatedDemand = await demand.save();
    res.json(updatedDemand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une demande
exports.deleteDemand = async (req, res) => {
  try {
    console.log("Tentative de suppression de l'ID:", req.params.id);

    // Vérifier si l'ID est valide pour MongoDB
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    // Utiliser findByIdAndDelete au lieu de remove()
    const demand = await Demands.findByIdAndDelete(req.params.id);

    if (!demand) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    console.log("Demande supprimée avec succès:", demand._id);
    res.status(200).json({
      message: "Demande supprimée avec succès",
      deletedDemand: demand,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};

// Récupérer les demandes d'un employé
exports.getEmployeeDemands = async (req, res) => {
  try {
    const demands = await Demands.find({
      employee: req.params.employeeId,
    }).populate("employee", "firstName lastName email");
    res.json(demands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Télécharger le PDF d'une demande
exports.downloadPdf = async (req, res) => {
  try {
    console.log("Demande de téléchargement PDF pour l'ID:", req.params.id);

    // Récupérer la demande avec les informations de l'employé
    const demand = await Demands.findById(req.params.id).populate("employee");

    if (!demand) {
      console.log("Demande non trouvée");
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    console.log(
      "Demande trouvée:",
      demand._id,
      "Type:",
      demand.type,
      "Status:",
      demand.status
    );

    // Vérifier si la demande est acceptée - temporairement commenté pour tests
    // if (demand.status !== "ACCEPTE") {
    //   console.log("Demande non acceptée, statut actuel:", demand.status);
    //   return res.status(403).json({
    //     message: "Seules les demandes acceptées peuvent être téléchargées",
    //   });
    // }

    // Récupérer les informations complètes de l'employé
    const employee = await Employee.findById(demand.employee._id);

    if (!employee) {
      console.log("Employé non trouvé");
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    console.log(
      "Employé trouvé:",
      employee._id,
      employee.firstName,
      employee.lastName
    );

    // Préparer les données pour le service PDF
    const demandData = {
      _id: demand._id,
      type: demand.type,
      status: demand.status,
      dateDebut: demand.dateDebut,
      dateFin: demand.dateFin,
      createdAt: demand.createdAt,
      reason: demand.reason || "",
    };

    console.log("Données préparées pour le PDF:", demandData);

    // Générer le PDF
    console.log("Appel du service PDF...");
    const pdfBuffer = await pdfService.generateDemandPdf(demandData, employee);
    console.log("PDF généré avec succès, taille:", pdfBuffer.length, "octets");

    // Définir les en-têtes pour le téléchargement
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=demande-${demand._id}.pdf`
    );

    console.log("En-têtes définis, envoi du PDF...");

    // Envoyer le PDF
    res.send(pdfBuffer);
    console.log("PDF envoyé avec succès");
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du PDF:", error);
    res.status(500).json({
      message: "Erreur lors de la génération du PDF",
      error: error.message,
      stack: error.stack,
    });
  }
};
