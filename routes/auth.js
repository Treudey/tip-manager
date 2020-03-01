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

// POST /auth/reset
router.post(
  '/reset', 
  [body('email').isEmail().normalizeEmail()],
  authController.resetPassword
);

// PUT /auth/reset
router.put(
  '/new-password', 
  [
    body('password').trim().isLength({ min: 5, max: 20 }),
    body('token').notEmpty()
  ],
  authController.updatePassword
);

module.exports = router;