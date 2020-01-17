const router = require('express').Router();

const User = require('../models/user.model');
const authController = require('../controllers/auth');

// GET /auth/userdata
router.get('/userdata', authController.getUserData);

// PUT /auth/signup
router.post('/signup', authController.signup);

// POST /auth/login
router.post('/login', authController.login);

module.exports = router;