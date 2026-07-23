const express = require('express');
const jwt = require('jsonwebtoken');
const Idea = require('../models/Idea');
const Suggestion = require('../models/Suggestion');

const router = express.Router();

// Helper middleware to require authentication (user or admin)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// GET all ideas, optional ?tag=xyz filter
router.get('/', async (req, res) => {
  try {
    const filter = req.query.tag ? { tags: req.query.tag } : {};
    const ideas = await Idea.find(filter).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all distinct tags from ideas
router.get('/tags', async (req, res) => {
  try {
    const tags = await Idea.distinct('tags');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single idea
router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json(idea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE an idea (requires login)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const idea = await Idea.create({
      title,
      content,
      username: req.user.username,
      tags: tags ? tags.map((t) => t.trim().toLowerCase()) : [],
    });
    res.status(201).json(idea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE an idea (requires admin or idea owner)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    if (req.user.role !== 'admin' && req.user.username !== idea.username) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Idea.findByIdAndDelete(req.params.id);
    await Suggestion.deleteMany({ idea: req.params.id });
    res.json({ message: 'Idea deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET suggestions for an idea
router.get('/:id/suggestions', async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ idea: req.params.id }).sort({ createdAt: 1 });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a suggestion to an idea (no login required, just username/text, same as comments)
router.post('/:id/suggestions', async (req, res) => {
  try {
    const { username, text } = req.body;
    if (!username || !text) {
      return res.status(400).json({ message: 'Username and text required' });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    const suggestion = await Suggestion.create({
      idea: req.params.id,
      username,
      text,
    });
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a suggestion (requires admin or suggestion author)
router.delete('/:id/suggestions/:suggestionId', requireAuth, async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.suggestionId);
    if (!suggestion) return res.status(404).json({ message: 'Suggestion not found' });

    if (req.user.role !== 'admin' && req.user.username !== suggestion.username) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Suggestion.findByIdAndDelete(req.params.suggestionId);
    res.json({ message: 'Suggestion deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
