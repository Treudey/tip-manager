const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tipSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  shiftLength: {
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  }
});

module.exports = mongoose.model('Tip', tipSchema);