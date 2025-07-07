const Demands = require("../models/Demand");
const pdfService = require("../services/pdfService");
const Employee = require("../models/Employee");
const path = require("path");
const fs = require("fs");

// Créer une nouvelle demande
exports.createDemand = async (req, res) => {
  try {
    const { type, dateDebut, dateFin } = req.body;

    // Vérifier que l'employé est authentifié
    if (!req.session.employeeId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    console.log(
      "Création d'une demande pour l'employé:",
      req.session.employeeId
    );

    // Convertir l'ID en string pour être sûr
    const employeeIdStr = req.session.employeeId.toString();

    // Créer la demande avec l'ID de l'employé
    const demand = new Demands({
      employee: employeeIdStr,
      type,
      dateDebut: type === "CONGE" ? dateDebut : null,
      dateFin: type === "CONGE" ? dateFin : null,
    });

    const savedDemand = await demand.save();
    console.log(
      "Demande créée avec succès:",
      savedDemand._id,
      "pour l'employé:",
      employeeIdStr
    );

    // Vérifier que l'employé a bien été enregistré
    const createdDemand = await Demands.findById(savedDemand._id);
    console.log(
      "Employé associé à la demande:",
      createdDemand.employee.toString()
    );

    res.status(201).json(savedDemand);
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    res.status(400).json({ message: error.message });
  }
};

// Récupérer toutes les demandes de l'employé connecté
exports.getAllDemands = async (req, res) => {
  try {
    // Vérifier que l'employé est authentifié
    if (!req.session.employeeId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Logs détaillés
    console.log("getAllDemands - Session ID:", req.sessionID);
    console.log("getAllDemands - Employé connecté ID:", req.session.employeeId);

    // Convertir l'ID en ObjectId pour la comparaison
    const mongoose = require("mongoose");
    const employeeId = mongoose.Types.ObjectId(req.session.employeeId);

    // Récupérer toutes les demandes
    const allDemands = await Demands.find().populate(
      "employee",
      "firstName lastName email"
    );

    console.log(
      `getAllDemands - Total de ${allDemands.length} demandes trouvées dans la base`
    );

    // Filtrer manuellement les demandes par ID d'employé
    const filteredDemands = allDemands.filter(
      (demand) =>
        demand.employee._id.toString() === req.session.employeeId.toString()
    );

    console.log(
      `getAllDemands - ${filteredDemands.length} demandes filtrées pour l'employé ${req.session.employeeId}`
    );

    // Vérifier les IDs des demandes filtrées
    if (filteredDemands.length > 0) {
      console.log(
        "getAllDemands - IDs des demandes filtrées:",
        filteredDemands.map((d) => d._id.toString())
      );
    }

    res.json(filteredDemands);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
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

// Récupérer toutes les demandes (pour les administrateurs)
exports.getAllDemandsAdmin = async (req, res) => {
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
      _id: demand._id, // Ajouter également _id pour compatibilité
      type: demand.type,
      status: demand.status || "EN_ATTENTE",
      createdAt: demand.createdAt,
      updatedAt: demand.updatedAt,
      startDate: demand.dateDebut,
      endDate: demand.dateFin,
      reason: demand.reason,
      employeeId: demand.employee._id,
      employeeName: `${demand.employee.firstName} ${demand.employee.lastName}`,
      employeeEmail: demand.employee.email,
    }));

    console.log("Demandes formatées:", JSON.stringify(formattedDemands[0]));

    res.json(formattedDemands);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des demandes pour l'employé: ${error}`
    );
    res.status(500).json({ message: error.message });
  }
};

// Télécharger le PDF d'une demande
exports.downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'ID est défini
    if (!id) {
      console.log("ID de demande manquant dans les paramètres");
      return res.status(400).json({ message: "ID de demande requis" });
    }

    console.log("Demande de téléchargement PDF pour l'ID:", id);

    // Vérifier que l'ID est un ObjectId valide
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ID de demande invalide:", id);
      return res.status(400).json({ message: "ID de demande invalide" });
    }

    // Récupérer la demande avec les informations de l'employé
    const demand = await Demands.findById(id).populate("employee");

    if (!demand) {
      console.log("Demande non trouvée pour l'ID:", id);
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

    // Récupérer les informations complètes de l'employé
    const employee = await Employee.findById(demand.employee._id);

    if (!employee) {
      console.log("Employé non trouvé pour l'ID:", demand.employee._id);
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
      // Ajouter d'autres champs si nécessaire
    };

    console.log("Données préparées pour le PDF:", demandData);

    try {
      // Générer le PDF
      console.log("Appel du service PDF...");
      const pdfBuffer = await pdfService.generateDemandPdf(
        demandData,
        employee
      );

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error("Le service PDF a généré un buffer vide");
        throw new Error("Le service PDF a généré un buffer vide");
      }

      console.log(
        "PDF généré avec succès, taille:",
        pdfBuffer.length,
        "octets"
      );

      // Définir les en-têtes pour le téléchargement
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=demande-${demand._id}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      console.log("En-têtes définis, envoi du PDF...");

      // Envoyer le PDF
      res.send(pdfBuffer);
      console.log("PDF envoyé avec succès");
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF:", pdfError);
      return res.status(500).json({
        message: "Erreur lors de la génération du PDF",
        error: pdfError.message,
      });
    }
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du PDF:", error);
    console.error(error.stack);
    res.status(500).json({
      message: "Erreur lors de la génération du PDF",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Endpoint temporaire pour déboguer
exports.debugDemands = async (req, res) => {
  try {
    // Récupérer toutes les demandes avec leurs employés associés
    const allDemands = await Demands.find().populate(
      "employee",
      "firstName lastName email"
    );

    // Créer un rapport de débogage
    const report = allDemands.map((demand) => ({
      demandId: demand._id,
      employeeId: demand.employee ? demand.employee._id : "Non défini",
      employeeName: demand.employee
        ? `${demand.employee.firstName} ${demand.employee.lastName}`
        : "Non défini",
      type: demand.type,
      status: demand.status,
      createdAt: demand.createdAt,
    }));

    // Si l'utilisateur est connecté, filtrer les demandes pour cet utilisateur
    let filteredDemands = [];
    if (req.session.employeeId) {
      filteredDemands = allDemands.filter(
        (demand) =>
          demand.employee &&
          demand.employee._id.toString() === req.session.employeeId.toString()
      );
    }

    res.json({
      sessionInfo: {
        sessionID: req.sessionID,
        employeeId: req.session.employeeId,
        email: req.session.email,
      },
      totalDemands: allDemands.length,
      filteredDemands: filteredDemands.length,
      report,
      filteredReport: filteredDemands.map((demand) => ({
        demandId: demand._id,
        employeeId: demand.employee._id,
        employeeName: `${demand.employee.firstName} ${demand.employee.lastName}`,
        type: demand.type,
        status: demand.status,
      })),
    });
  } catch (error) {
    console.error("Erreur de débogage:", error);
    res.status(500).json({ message: error.message });
  }
};

// Route de débogage pour tester la génération de PDF
exports.debugPdf = async (req, res) => {
  try {
    console.log("Test de génération PDF pour l'ID:", req.params.id);

    // Récupérer la demande avec les informations de l'employé
    const demand = await Demands.findById(req.params.id).populate("employee");

    if (!demand) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    // Récupérer les informations complètes de l'employé
    const employee = await Employee.findById(demand.employee._id);

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

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

    // Renvoyer les données qui seraient utilisées pour générer le PDF
    return res.status(200).json({
      message: "Données pour la génération du PDF",
      demand: demandData,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
      },
      templatePath: path.join(__dirname, "../templates/pdf/demand.html"),
      templateExists: fs.existsSync(
        path.join(__dirname, "../templates/pdf/demand.html")
      ),
      logoPath: path.join(__dirname, "../public/images/logo.png"),
      logoExists: fs.existsSync(
        path.join(__dirname, "../public/images/logo.png")
      ),
    });
  } catch (error) {
    console.error("Erreur lors du test de génération PDF:", error);
    return res.status(500).json({
      message: "Erreur lors du test de génération PDF",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
