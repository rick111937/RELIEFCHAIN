const mongoose = require('mongoose');
const DonationSchema = new mongoose.Schema({
  // TODO: define schema fields for Donation
}, { timestamps: true });
module.exports = mongoose.model('Donation', DonationSchema);
