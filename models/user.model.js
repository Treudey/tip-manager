const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiry: Date,
  resetTokenRequestDate: Date,
  tips: [{
    type: Schema.Types.ObjectId, 
    ref: 'Tip'
  }],
  positions: [{ type: String }],
  shiftTypes: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);