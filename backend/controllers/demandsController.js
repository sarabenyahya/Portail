const Demands = require("../models/Demand");

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
    const demand = await Demands.findById(req.params.id);
    if (!demand) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    await demand.remove();
    res.json({ message: "Demande supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
