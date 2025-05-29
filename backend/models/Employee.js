const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

// Hash le mot de passe avant de sauvegarder
employeeSchema.pre("save", async function (next) {
  const employee = this;
  if (employee.isModified("password")) {
    employee.password = await bcrypt.hash(employee.password, 8);
  }
  next();
});

// Vérifier les identifiants
employeeSchema.statics.findByCredentials = async (email, password) => {
  const employee = await Employee.findOne({ email });
  if (!employee) {
    throw new Error("Email ou mot de passe incorrect");
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

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
