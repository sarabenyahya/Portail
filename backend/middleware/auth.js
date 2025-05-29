const Employee = require('../models/Employee');

const auth = async (req, res, next) => {
  try {
    if (!req.session.employeeId) {
      throw new Error();
    }

    const employee = await Employee.findById(req.session.employeeId);
    if (!employee) {
      throw new Error();
    }

    req.employee = employee;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Veuillez vous authentifier' });
  }
};

module.exports = auth;