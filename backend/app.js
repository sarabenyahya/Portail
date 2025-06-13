const express = require("express");
const connectDB = require("./conf/db");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const demandRoutes = require("./routes/demandRoutes");
const authRoutes = require("./routes/authRoutes");
const Demand = require("./models/Demand");

const server = express();

// Middleware
server.use(express.json());

server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Middleware pour déboguer les sessions
server.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  next();
});

// Routes de base
server.get("/api/demands", async (req, res) => {
  try {
    const demands = await Demand.find(); // ou équivalent selon ta base
    res.json(demands);
  } catch (error) {
    console.error("Erreur serveur /api/demands:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
});

// Routes pour les demandes et l'authentification
server.use("/api/demands", demandRoutes);
server.use("/api/auth", authRoutes);

// Connexion à la base de données
connectDB();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ le serveur est démarré sur http://localhost:${PORT}`);
});
