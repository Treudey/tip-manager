const router = require('express').Router();
const { body } = require('express-validator');

const User = require('../models/user.model');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/isAuth')

// GET /auth/userdata
router.get('/userdata', isAuth, authController.getUserData);

// GET /auth/userdatatips
router.get('/userdatatips', isAuth, authController.getUserDataWithTips);

// GET /auth/userlists
router.get('/userlists', isAuth, authController.getUserOptionsLists);

// POST /auth/signup
router.post(
  '/signup', 
  [
    body('email')
      .isEmail()
      .custom(value => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email address already exists!');
          }
        })
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5, max: 20 }),
    body('name').trim().isLength({ min: 2, max: 20 })
  ], 
  authController.signup
);

// PUT /auth/update
router.put(
  '/update', 
  isAuth,
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 20 }),
    body('isPasswordChange').isBoolean()
  ], 
  authController.update
);

// POST /auth/login
router.post(
  '/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 5, max: 20 })
  ],
  authController.login
);

module.exports = router;