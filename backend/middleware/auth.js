module.exports = function (req, res, next) {
  if (req.session && req.session.employeeId) {
    next();
  } else {
    res.status(401).json({ message: "Non autorisé. Veuillez vous connecter." });
  }
};
