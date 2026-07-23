const express = require('express');
const Comment = require('../models/Comment');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { apiLimiter, writeLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// GET comments for a post
router.get('/:postId', apiLimiter, requireAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a comment (requires auth)
router.post('/:postId', writeLimiter, requireAuth, async (req, res) => {
  try {
    const { text, replyTo } = req.body;
    const username = req.user.username || req.body.username;
    if (!username || !text) {
      return res.status(400).json({ message: 'Username and text required' });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      username,
      text,
      replyTo: replyTo || null,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a comment (admin only)
router.delete('/:commentId', writeLimiter, requireAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
