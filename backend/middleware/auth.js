module.exports = (req, res, next) => {
  console.log("Vérification de l'authentification...");
  console.log("Session:", req.session);

  // Vérifier si l'utilisateur est connecté
  if (!req.session || !req.session.employeeId) {
    console.log("Utilisateur non authentifié");
    return res.status(401).json({ message: "Non autorisé" });
  }

  console.log("Utilisateur authentifié:", req.session.employeeId);
  next();
};
