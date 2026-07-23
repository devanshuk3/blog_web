const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { apiLimiter, writeLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// GET all posts, optional ?tag=xyz filter
router.get('/', apiLimiter, requireAuth, async (req, res) => {
  try {
    const filter = req.query.tag ? { tags: req.query.tag } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all distinct tags (used to build the tag filter bar)
router.get('/tags', apiLimiter, requireAuth, async (req, res) => {
  try {
    const tags = await Post.distinct('tags');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single post
router.get('/:id', apiLimiter, requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a post (admin only)
router.post('/', writeLimiter, requireAdmin, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const post = await Post.create({
      title,
      content,
      tags: tags ? tags.map((t) => t.trim().toLowerCase()) : [],
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a post (admin only)
router.delete('/:id', writeLimiter, requireAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE a post (admin only)
router.put('/:id', writeLimiter, requireAdmin, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        tags: tags ? tags.map((t) => t.trim().toLowerCase()) : [],
      },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LIKE a post (requires auth)
router.post('/:id/like', writeLimiter, requireAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
