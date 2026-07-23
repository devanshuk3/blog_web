const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// REGISTER normal user
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    const existingAdmin = await Admin.findOne({ username: cleanUsername });
    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: cleanUsername,
      passwordHash,
      role: 'user',
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: 'user' },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, username: user.username, role: 'user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN user or admin
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const cleanUsername = username.trim();

    // Check Admin model first
    let account = await Admin.findOne({ username: cleanUsername });
    let role = 'admin';

    // If not found in Admin, check User model
    if (!account) {
      account = await User.findOne({ username: cleanUsername });
      role = account ? account.role || 'user' : 'user';
    }

    if (!account) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, account.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: account._id, username: account.username, role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '7d' }
    );

    res.json({ token, username: account.username, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET current user profile
router.get('/me', apiLimiter, requireAuth, async (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
