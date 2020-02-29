const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const { advErrorHandler, errorHandler } = require('../utils/errorHandlers');

exports.getUserData = (req, res, next) => {
  const userID = req.userID;

  User.findById(userID)
    .then(user => {
      res.status(200).json({
        message: 'Successfully fetched all user data', 
        user: {
          name: user.name,
          email: user.email,
          positions: user.positions,
          shiftTypes: user.shiftTypes
        }
      });
    })
    .catch(err => errorHandler(err, next));
};

exports.getUserDataWithTips = (req, res, next) => {
  const userID = req.userID;

  User.findById(userID)
    .populate({path: 'tips', options: {sort:{'date': 'descending'}}})
    .then(user => {
      res.status(200).json({
        message: 'Successfully fetched all user data and tips', 
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
    advErrorHandler('Validation failed.', 422);
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

exports.update = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    advErrorHandler('Validation failed.', 422);
  }

  const userID = req.userID;
  const { name, email, isPasswordChange } = req.body;

  if (isPasswordChange) {
    const oldPassword =  req.body.oldPassword.trim();
    const newPassword =  req.body.newPassword.trim();
    const confirmPassword =  req.body.confirmPassword.trim();
    const psswrds = [ oldPassword, newPassword, confirmPassword ];
    psswrds.forEach(el => {
      if (el.length < 5 || el.length > 20) {
        advErrorHandler('Validation failed.', 422)
      }
    });

    if (newPassword !== confirmPassword) {
      advErrorHandler('The passwords do not match.', 409);
    }

    let loadedUser;
    User.findById( userID )
      .then(user => {
        loadedUser = user;
        return bcrypt.compare(oldPassword, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          advErrorHandler('Incorrect password!', 401);
        }
        return bcrypt.hash(newPassword, 12);
      })
      .then(hashedPwd => {
        console.log(hashedPwd);
        loadedUser.password = hashedPwd;
        loadedUser.name = name;
        loadedUser.email = email;
  
        return loadedUser.save();
      })
      .then(result => {
        res.status(201).json({ message: 'User updated', userID: result._id });
      })
      .catch(err => errorHandler(err, next));
  } else {
    User.findById(userID)
      .then(user => {
        user.name = name;
        user.email = email;

        return user.save();
      })
      .then(result => {
        res.status(201).json({ message: 'User updated', userID: result._id });
      })
      .catch(err => errorHandler(err, next));
  }
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    advErrorHandler('Validation failed.', 422);
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
