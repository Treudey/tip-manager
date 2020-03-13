const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const csv = require('fast-csv');
const json2csv = require("json2csv").parse;

const Tip = require('../models/tip.model');
const User = require('../models/user.model');
const { advErrorHandler, errorHandler } = require('../utils/errorHandlers');
const fileHelper = require('../utils/file');

exports.getTips = (req, res, next) => {
  const userID = req.userID;
  
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
  const userID = req.userID;
  const tipID = req.params.tipID;

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
    advErrorHandler('Validation failed.', 422);
  }

  const userID = req.userID;
  const { amount, position, shiftType, shiftLength, date } = req.body;

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
    advErrorHandler('Validation failed.', 422);
  }

  const tipID = req.params.tipID;
  const userID = req.userID;
  const { amount, position, shiftType, shiftLength, date } = req.body;

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

exports.convertFileToTips = (req, res, next) => {
  const userID = req.userID;
  if (!req.file) {
    advErrorHandler('No valid file provided', 422);
  }

  const fileUrl = req.file.path.replace('\\', '/');
  const stream = fs.createReadStream(fileUrl);
  const tips = [];
  let isValid = true;

  const csvStream = csv.parse()
    .on('data', (data) => {
      const dateParts = data[0].split('/');
      const date = new Date(
        Number(dateParts[2]),
        Number(dateParts[0]) - 1,
        Number(dateParts[1])
      );

      const tipObject = {
        user: userID,
        date,
        position: data[1],
        shiftType: data[2],
        amount: Number(data[3]),
        shiftLength: Number(data[4])
      }; 
      for (const key in tipObject) {
        if (tipObject.hasOwnProperty(key)) {
          const element = tipObject[key];
          if (!element) {
            isValid = false;
          }
        }
      }
      const newTip = new Tip(tipObject);
      tips.push(newTip);

      User.findById(userID)
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
        .catch(err => errorHandler(err, next));
    })
    .on('end', () => {
      console.log("End of file import");
      fileHelper.deleteFile(fileUrl);
      if (tips.length > 1000) {
        const err = new Error('CSV File is too large to enter into database at onece.');
        err.statusCode = 400;
        return next(err);
      }
      if (!isValid) {
        const err = new Error('File was not formatted properly.');
        err.statusCode = 422;
        return next(err);
      }
      Tip.create(tips)
        .then(result => {
          res.status(200).json({ message : "Successfully added all data from file to database." });    
        })
        .catch(err => errorHandler(err, next));
    });

  stream.pipe(csvStream);
};

exports.getTipsFile = (req, res, next) => {
  const userID = req.userID;
  const fileName = 'tips-' + userID + '.csv';
  const filePath = path.join('csvs', fileName);
  const fields = ['date', 'position', 'shiftType', 'amount', 'shiftLength'];
  const writeStream = fs.createWriteStream(filePath);

  Tip.find({ user: userID }).lean()
    .then(tips => {
      let csv;
      try {
        tips.forEach(tip => {
          let date = tip.date.toISOString();
          date = date.slice(0, date.indexOf('T'));
          const dateParts = date.split('-');
          tip.date = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
        });
        csv = json2csv(tips, { fields });
      } catch (err) {
        advErrorHandler(err.message, 500);
      }
      fs.writeFile(filePath, csv, (err) => {
        if (err) {
          advErrorHandler(err.message, 500);
        }

        setTimeout(() => {
          fileHelper.deleteFile(fileUrl); // delete this file after 30 seconds
        }, 30000);
        res.download(filePath);
      });
    });
};

exports.deleteTip = (req, res, next) => {
  const tipID = req.params.tipID;
  const userID = req.userID;

  let storedUser;
  let tipToBeDeleted;
  Tip.findById(tipID)
    .then(tip => {
      tipToBeDeleted = tip;
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
      storedUser = user;
      user.tips.pull({ _id: tipID });
      return Tip.find({ user: userID });
    })
    .then(tips => {
      let containsPosition = false;
      let containsShiftType = false;
      for (let i = 0; i < tips.length; i++) {
        const tip = tips[i];
        if (tipToBeDeleted.position === tip.position) {
          containsPosition = true;
        }
        if (tipToBeDeleted.shiftType === tip.shiftType) {
          containsShiftType = true;
        }
      }
      if (!containsPosition) {
        storedUser.positions.pull(tipToBeDeleted.position);
      }
      if (!containsShiftType) {
        storedUser.shiftTypes.pull(tipToBeDeleted.shiftType);
      }
      return storedUser.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Tip deleted' });
    })
    .catch(err => errorHandler(err, next));
};

