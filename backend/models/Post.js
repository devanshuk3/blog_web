const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
