const router = require('express').Router();
const { body } = require('express-validator');

const User = require('../models/user.model');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth')

// GET /auth/userdata
router.get('/userdata', isAuth, authController.getUserData);

// GET /auth/userlists
router.get('/userlists', isAuth, authController.getUserOptionsLists);

// PUT /auth/userlists
router.put('/userlists', isAuth, authController.addToUserOptionsLists);

// POST /auth/signup
router.post('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('Email address already exists!');
        }
      })
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 5, max: 20 }),
  body('name')
    .trim()
    .isLength({ min: 2, max: 20 })
  
], authController.signup);

// POST /auth/login
router.post('/login', authController.login);

module.exports = router;