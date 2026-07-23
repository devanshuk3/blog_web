const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    isLiked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', answerSchema);
