// models/MailboxScan.js
const mongoose = require('mongoose');

const mailboxScanSchema = new mongoose.Schema({
  scanTime: { type: Date, required: true }
});

module.exports = mongoose.model('MailboxScan', mailboxScanSchema);
