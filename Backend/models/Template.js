const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  image: String,
  variables: [{
    type: { type: String, enum: ['text', 'qr'], default: 'text' },
    name: String,
    x: Number,
    y: Number,
    fontSize: Number,
    fontFamily: String,
    color: String,
    size: Number
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', TemplateSchema);