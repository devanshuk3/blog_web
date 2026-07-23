const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    username: { type: String, required: true },
    tags: [{ type: String }],
    isAnswered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
