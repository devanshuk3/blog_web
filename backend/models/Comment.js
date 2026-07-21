const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    replyTo: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
