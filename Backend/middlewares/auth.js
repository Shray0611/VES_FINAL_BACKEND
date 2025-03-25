const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) throw new Error('Access denied');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user || (roles.length && !roles.includes(user.role))) {
        throw new Error('Unauthorized');
      }
      
      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  };
};

module.exports = auth;