const User = require('../models/user.model');
const { advErrorHandler, errorHandler } = require('../utils/errorHandlers');

exports.getUserData = (req, res, next) => {
  const userID = req.query.userID;

  if (!userID) {
    advErrorHandler('Please provide a userID as query', 400);
  }

  User.findById(userID)
    .populate({path: 'tips', options: {sort:{'date': 'descending'}}})
    .then(user => {
      res.status(200).json({message: 'Successfully fetched all user data', user });
    })
    .catch(err => errorHandler(err, next));
};

exports.signup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  User.findOne({email})
    .then(userDoc => {
      if (userDoc) {
        advErrorHandler('This email is already associated with an account.', 409);
      }
      if (password !== confirmPassword) {
        advErrorHandler('The passwords do not match.', 409);
      }

      const newUser = new User({
        name,
        email, 
        password,
        tips: []
      });
      return newUser.save();
    })
    .then(result => {
      res.status(201).json({ message: 'New user created!', userID: result._id });
    })
    .catch(err => errorHandler(err, next));
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({email})
    .then(user => {
      if (!user || (user.password !== password)) {
        advErrorHandler('Invalid email or password.', 401);
      }
      res.status(200).json({ message: 'User logged in', userID: user._id.toString() })
    })
    .catch(err => console.log(err));
};
