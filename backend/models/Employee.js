const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  // Champs du backoffice (obligatoires)
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
    ref: "Department",
  },
  hireDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Champs pour l'authentification du portail (optionnels)
  password: {
    type: String,
    required: false, // Pas obligatoire pour permettre la compatibilité
    minlength: 6,
  },

  // Champ virtuel pour compatibilité avec l'ancien modèle du portail
  name: {
    type: String,
    required: false,
  },
});

// Virtual pour le nom complet (compatibilité avec le portail)
employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash le mot de passe avant de sauvegarder (pour le portail)
employeeSchema.pre("save", async function (next) {
  const employee = this;
  if (employee.isModified("password") && employee.password) {
    employee.password = await bcrypt.hash(employee.password, 8);
  }
  next();
});

// Méthode pour vérifier les identifiants (pour le portail)
employeeSchema.statics.findByCredentials = async (email, password) => {
  const Employee = mongoose.model("Employee");
  const employee = await Employee.findOne({ email });

  if (!employee) {
    throw new Error("Email ou mot de passe incorrect");
  }

  if (!employee.password) {
    throw new Error("Mot de passe non défini pour cet employé");
  }

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return employee;
};

// Supprimer le mot de passe lors de la conversion en JSON
employeeSchema.methods.toJSON = function () {
  const employee = this;
  const employeeObject = employee.toObject();
  delete employeeObject.password;
  return employeeObject;
};

// Méthode pour vérifier un mot de passe
employeeSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
