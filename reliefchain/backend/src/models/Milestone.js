const mongoose = require('mongoose');
const MilestoneSchema = new mongoose.Schema({
  // TODO: define schema fields for Milestone
}, { timestamps: true });
module.exports = mongoose.model('Milestone', MilestoneSchema);
