const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: false },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
  ngoAddress: { type: String, required: false },
  bannerImage: { type: String, required: true },
  imageIcon: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
