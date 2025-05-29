const express = require("express");
const connectDB = require("./conf/db");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const demandRoutes = require("./routes/demandRoutes");
const authRoutes = require("./routes/authRoutes");

const server = express();

// Middleware
server.use(express.json());

server.use(
  cors({
    origin: "http://localhost:5174",
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

// Routes de base
server.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API du Portail des Employés" });
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
