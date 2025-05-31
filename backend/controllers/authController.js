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

    // Trouver l'employé
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Créer la session
    req.session.employeeId = employee._id;

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Déconnexion
exports.logoutUser = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Erreur lors de la déconnexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Déconnexion réussie" });
    });
  } catch (error) {
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
