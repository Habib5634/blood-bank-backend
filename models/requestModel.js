// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAccepted: { type: Boolean, default: false },
  isRead:{type: Boolean, default: false},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
