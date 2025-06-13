module.exports = (req, res, next) => {
  // Vérifier si l'utilisateur est connecté
  if (!req.session || !req.session.employeeId) {
    console.log("Authentification échouée - Pas de session ou d'employeeId");
    return res.status(401).json({ message: "Non autorisé" });
  }

  console.log("Utilisateur authentifié:", req.session.employeeId);
  next();
};
