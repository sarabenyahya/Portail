const mongoose = require("mongoose");

const demandsSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  type: {
    type: String,
    enum: ["CONGE", "ATTESTATION"],
    required: true,
  },
  status: {
    type: String,
    enum: ["EN_ATTENTE", "ACCEPTE", "REFUSE"],
    default: "EN_ATTENTE",
  },
  dateDebut: {
    type: Date,
    required: function () {
      return this.type === "CONGE";
    },
  },
  dateFin: {
    type: Date,
    required: function () {
      return this.type === "CONGE";
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Demand", demandsSchema);
