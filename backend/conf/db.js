const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ connexion réussie avec la base de données");
  } catch (error) {
    console.error(`❌ problème de connexion à la base de données: ${error}`);
  }
};

module.exports = connectDB;
