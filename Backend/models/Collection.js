const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: String,
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Certificate" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Collection', CollectionSchema);