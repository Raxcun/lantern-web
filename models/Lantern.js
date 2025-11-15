const mongoose = require('mongoose');

const lanternSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150, // จำกัดตัวอักษร
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lantern', lanternSchema);
