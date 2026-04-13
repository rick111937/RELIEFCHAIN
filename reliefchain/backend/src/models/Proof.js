const mongoose = require('mongoose');
const ProofSchema = new mongoose.Schema({
  // TODO: define schema fields for Proof
}, { timestamps: true });
module.exports = mongoose.model('Proof', ProofSchema);
