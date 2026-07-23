const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Suggestion', suggestionSchema);
