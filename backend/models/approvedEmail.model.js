const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApprovedEmailSchema = new Schema({
  conversationId: { type: String, required: true, unique: true },
  approvedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ApprovedEmail', ApprovedEmailSchema);
