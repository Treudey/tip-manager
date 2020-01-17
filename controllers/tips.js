const Tip = require('../models/tip.model');
const User = require('../models/user.model');
const { advErrorHandler, errorHandler } = require('../utils/errorHandlers');

exports.getTips = (req, res, next) => {
  const userID = req.query.userID;

  if (!userID) {
    advErrorHandler('Please provide a userID as query', 400);
  }
  
  User.findById(userID)
    .populate('tips')
    .then(user => {
      res.status(200)
        .json({ 
          message: 'Successfully fetched all tips', 
          tips: user.tips
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
  const { userID, amount, shiftLength, date } = req.body;

  const newTip = new Tip({
    user: userID,
    amount: Number(amount),
    shiftLength: Number(shiftLength),
    date: Date.parse(date)
  });

  newTip.save()
    .then(result => {
      return User.findById(userID);
    })
    .then(user => {
      user.tips.push(newTip);
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'Tip successfully added', tip: newTip });
    })
    .catch(err => errorHandler(err, next));
};

exports.updateTip = (req, res, next) => {
  const tipID = req.params.tipID;
  const { userID, amount, shiftLength, date } = req.body;

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
      tip.date = Date.parse(date);
      return tip.save();
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
      console.log(userID);
      console.log(tip.user);
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

