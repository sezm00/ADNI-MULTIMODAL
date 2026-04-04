const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const inMemoryUsers = require('../inMemoryStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, role, age, gender, phone, address } = req.body;

    if (isDBConnected()) {
      // --- MongoDB path ---
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      user = new User({ name, email, password, role, age, gender, phone, address });
      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
      });
    } else {
      // --- In-memory fallback ---
      const existing = inMemoryUsers.find(u => u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Date.now().toString();
      const avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
      const newUser = { id, name, email, password: hashedPassword, role: role || 'patient', age, gender, phone, address, avatar };
      inMemoryUsers.push(newUser);

      const token = jwt.sign(
        { userId: id, role: newUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (in-memory)',
        token,
        user: { id, name, email, role: newUser.role, avatar }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password, role } = req.body;
    console.log('Login attempt:', { email, role });

    if (isDBConnected()) {
      // --- MongoDB path ---
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      if (role && user.role !== role) {
        return res.status(400).json({ success: false, message: `Please login as ${user.role}` });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
      });
    } else {
      // --- In-memory fallback ---
      const user = inMemoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      if (role && user.role !== role) {
        return res.status(400).json({ success: false, message: `Please login as ${user.role}` });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful (in-memory)',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
