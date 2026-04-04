const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const inMemoryUsers = require('../inMemoryStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    let user;
    if (isDBConnected()) {
      user = await User.findById(decoded.userId).select('-password');
    } else {
      // In-memory fallback
      const memUser = inMemoryUsers.find(u => u.id === decoded.userId);
      if (memUser) {
        const { password, ...userData } = memUser;
        user = userData;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Middleware to check if user is a doctor
const isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Access denied. Doctor role required.' });
  }
  next();
};

// Middleware to check if user is a patient
const isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ success: false, message: 'Access denied. Patient role required.' });
  }
  next();
};

module.exports = { auth, isDoctor, isPatient };
