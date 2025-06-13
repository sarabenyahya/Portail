const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");

// Inscription d'un nouvel employé
exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      birthDate,
      phone,
      email,
      address,
      department,
      hireDate,
      status,
      password,
    } = req.body;

    // Vérifier si l'employé existe déjà
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Créer un nouvel employé
    const employee = new Employee({
      firstName,
      lastName,
      gender,
      birthDate,
      phone,
      email,
      address,
      department,
      hireDate,
      status,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(password, salt);

    await employee.save();

    // Créer la session
    req.session.employeeId = employee._id;

    res.status(201).json({
      message: "Employé créé avec succès",
      employee: {
        _id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Connexion d'un employé
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Tentative de connexion pour:", email);

    // Trouver l'employé
    const employee = await Employee.findOne({ email });
    if (!employee) {
      console.log("Employé non trouvé:", email);
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le mot de passe existe dans la base de données
    if (!employee.password) {
      console.log("Mot de passe non défini pour l'employé:", email);
      return res
        .status(401)
        .json({ message: "Compte incomplet. Contactez l'administrateur." });
    }

    // Vérifier le mot de passe
    try {
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        console.log("Mot de passe incorrect pour:", email);
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }
    } catch (compareError) {
      console.error(
        "Erreur lors de la comparaison des mots de passe:",
        compareError
      );
      return res.status(500).json({ message: "Erreur d'authentification" });
    }

    // Approche simplifiée : au lieu de détruire et régénérer la session,
    // on va simplement réinitialiser ses propriétés
    req.session.employeeId = employee._id.toString();
    req.session.email = employee.email;

    console.log("Session mise à jour pour:", employee._id, employee.email);
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", req.session);

    // Sauvegarder la session
    req.session.save((err) => {
      if (err) {
        console.error("Erreur lors de la sauvegarde de la session:", err);
        return res.status(500).json({ message: "Erreur de session" });
      }

      res.json({
        message: "Connexion réussie",
        employee: {
          _id: employee._id,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
        },
      });
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ message: error.message });
  }
};

// Déconnexion d'un employé
exports.logoutUser = async (req, res) => {
  try {
    // Détruire la session
    req.session.destroy((err) => {
      if (err) {
        console.error("Erreur lors de la déconnexion:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la déconnexion" });
      }

      // Effacer les deux cookies de session
      res.clearCookie("employee.sid");
      res.clearCookie("connect.sid");

      res.json({ message: "Déconnexion réussie" });
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    res.status(500).json({ message: error.message });
  }
};

// Vérifier la session
exports.checkSession = async (req, res) => {
  try {
    if (!req.session.employeeId) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const employee = await Employee.findById(req.session.employeeId).select(
      "-password"
    );
    if (!employee) {
      return res.status(401).json({ message: "Employé non trouvé" });
    }

    res.json({
      isAuthenticated: true,
      employee: {
        _id: employee._id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
