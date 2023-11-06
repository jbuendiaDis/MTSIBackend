const mongoose = require('mongoose');

// Define the schema for the audit model
const auditSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  errorDescription: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: String,
    default: () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      return `${dd}/${mm}/${yy}`;
    },
  },
});

// Create the audit model
const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;
