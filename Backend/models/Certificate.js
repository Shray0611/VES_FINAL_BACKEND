const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  studentData: Object,
  email: String,
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  verificationCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', CertificateSchema);