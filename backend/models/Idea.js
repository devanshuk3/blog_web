const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    username: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Idea', ideaSchema);
