const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const { advErrorHandler, errorHandler } = require('../utils/errorHandlers');

exports.getUserData = (req, res, next) => {
  const userID = req.userID;

  User.findById(userID)
    .populate({path: 'tips', options: {sort:{'date': 'descending'}}})
    .then(user => {
      res.status(200).json({
        message: 'Successfully fetched all user data', 
        user: {
          name: user.name,
          email: user.email,
          tips: user.tips,
          positions: user.positions,
          shiftTypes: user.shiftTypes
        }
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.getUserOptionsLists = (req, res, next) => {
  const userID = req.userID;

  User.findById(userID)
    .then(user => {
      res.status(200).json({
        message: 'Successfully fetched user positions and shift types', 
        positions: user.positions,
        shiftTypes: user.shiftTypes
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error =  new Error('Validation failed.');
    error.statusCode = 422; 
    error.data = errors.array();
    throw error;
  }

  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    advErrorHandler('The passwords do not match.', 409);
  }

  bcrypt.hash(password, 12)
    .then(hashedPwd => {
      const newUser = new User({
        name,
        email, 
        password: hashedPwd
      });

      return newUser.save();
    })
    .then(result => {
      res.status(201).json({ message: 'New user created!', userID: result._id });
    })
    .catch(err => errorHandler(err, next));
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error =  new Error('Validation failed.');
    error.statusCode = 422; 
    error.data = errors.array();
    throw error;
  }

  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        advErrorHandler('A user with this email could not be found.', 401);
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        advErrorHandler('Incorrect password!', 401);
      }
      const jwtKey = process.env.JWT_KEY;
      const token = jwt.sign(
        { 
          email: loadedUser.email,
          userID: loadedUser._id.toString()
        }, 
        jwtKey,
        { expiresIn: '1h' }
      );
      res.status(200)
        .json({ 
          message: 'User logged in', 
          token, 
          userID: loadedUser._id.toString() 
        })
    })
    .catch(err => errorHandler(err, next));
};
