const { validationResult } = require('express-validator');

const Tip = require('../models/tip.model');
const User = require('../models/user.model');
const { advErrorHandler, errorHandler } = require('../utils/errorHandlers');

exports.getTips = (req, res, next) => {
  const userID = req.query.userID;

  if (!userID) {
    advErrorHandler('Please provide a userID as query', 400);
  }
  
  Tip.find({ user: userID })
    .sort({ 'date' : 'descending' })
    .then(tips => {
      res.status(200)
        .json({ 
          message: 'Successfully fetched all tips', 
          tips
        });
    })
    .catch(err => errorHandler(err, next));
};

exports.getTip = (req, res, next) => {
  const userID = req.query.userID;
  const tipID = req.params.tipID;
  
  if (!userID) {
    advErrorHandler('Please provide a userID as query', 400);
  }

  console.log(tipID);
  console.log(userID);
  Tip.findById(tipID)
    .then(tip => {
      if (!tip) {
        advErrorHandler('Could not find tip', 404);
      }
      if (tip.user.toString() !== userID) {
        advErrorHandler('Not authorized!', 403);
      }
      
      res.status(200).json({ message: 'Tip fetched', tip });
    })
    .catch(err => errorHandler(err, next));
};

exports.createTip = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      message: 'Validation failed.', 
      errors: errors.array() 
    });
  }

  const { userID, amount, position, shiftType, shiftLength, date } = req.body;

  const newTip = new Tip({
    user: userID,
    amount: Number(amount),
    position, 
    shiftType,
    shiftLength: Number(shiftLength),
    date: Date.parse(date)
  });

  newTip.save()
    .then(result => {
      return User.findById(userID);
    })
    .then(user => {
      user.tips.push(newTip);
      if (!user.positions.includes(newTip.position)) {
        user.positions.push(newTip.position);
      }
      if (!user.shiftTypes.includes(newTip.shiftType)) {
        user.shiftTypes.push(newTip.shiftType);
      }
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'Tip successfully added', tip: newTip });
    })
    .catch(err => errorHandler(err, next));
};

exports.updateTip = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      message: 'Validation failed.', 
      errors: errors.array() 
    });
  }

  const tipID = req.params.tipID;
  const { userID, amount, position, shiftType, shiftLength, date } = req.body;

  Tip.findById(tipID)
    .then(tip => {
      if (!tip) {
        advErrorHandler('Could not find tip', 404);
      }
      if (tip.user.toString() !== userID) {
        advErrorHandler('Not authorized!', 403);
      }

      tip.amount = Number(amount);
      tip.shiftLength = Number(shiftLength);
      tip.position = position;
      tip.shiftType = shiftType;
      tip.date = Date.parse(date);
      tip.save()
        .then(result => {
          User.findById(userID)
            .then(user => {
              if (!user.positions.includes(tip.position)) {
                user.positions.push(tip.position);
              }
              if (!user.shiftTypes.includes(tip.shiftType)) {
                user.shiftTypes.push(tip.shiftType);
              }
              return user.save();
            })
            .catch(err => errorHandler(err, next));
        })
        .catch(err => errorHandler(err, next));
    })
    .then(result => {
      res.status(200).json({ message: 'Tip successfully updated', tip: result });
    })
    .catch(err => errorHandler(err, next));
};

exports.deleteTip = (req, res, next) => {
  const tipID = req.params.tipID;
  const userID = req.body.userID;

  Tip.findById(tipID)
    .then(tip => {
      if (!tip) {
        advErrorHandler('Could not find tip', 404);
      }
      if (tip.user.toString() !== userID) {
        advErrorHandler('Not authorized!', 403);
      }
      return Tip.findByIdAndRemove(tipID);
    })
    .then(result => {
      return User.findById(userID);
    })
    .then(user => {
      user.tips.pull(tipID);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Tip deleted' });
    })
    .catch(err => errorHandler(err, next));
};

