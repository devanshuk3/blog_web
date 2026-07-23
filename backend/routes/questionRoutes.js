const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { requireAuth } = require('../middleware/authMiddleware');
const { apiLimiter, writeLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// GET all questions, optional ?tag=xyz filter
router.get('/', apiLimiter, requireAuth, async (req, res) => {
  try {
    const filter = req.query.tag ? { tags: req.query.tag } : {};
    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all distinct tags from questions
router.get('/tags', apiLimiter, requireAuth, async (req, res) => {
  try {
    const tags = await Question.distinct('tags');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single question
router.get('/:id', apiLimiter, requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a question (requires login)
router.post('/', writeLimiter, requireAuth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const question = await Question.create({
      title,
      content,
      username: req.user.username,
      tags: tags ? tags.map((t) => t.trim().toLowerCase()) : [],
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a question (requires admin or question owner)
router.delete('/:id', writeLimiter, requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Check if admin or owner
    if (req.user.role !== 'admin' && req.user.username !== question.username) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Question.findByIdAndDelete(req.params.id);
    await Answer.deleteMany({ question: req.params.id });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET answers for a question
router.get('/:id/answers', apiLimiter, requireAuth, async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.id }).sort({ createdAt: 1 });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST an answer to a question (requires login)
router.post('/:id/answers', writeLimiter, requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const username = req.user.username || req.body.username;
    if (!username || !text) {
      return res.status(400).json({ message: 'Username and text required' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const answer = await Answer.create({
      question: req.params.id,
      username,
      text,
    });
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SELECT/LIKE an answer (toggles isLiked, requires login, must be author of the question or admin)
router.post('/:id/answers/:answerId/like', writeLimiter, requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Must be the question author or an admin
    if (req.user.role !== 'admin' && req.user.username !== question.username) {
      return res.status(403).json({ message: 'Only the question author or admin can select liked answers' });
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    // Toggle isLiked
    answer.isLiked = !answer.isLiked;
    await answer.save();

    // Recalculate question answered state
    const hasLiked = await Answer.exists({ question: question._id, isLiked: true });
    if (hasLiked) {
      question.isAnswered = true;
      if (!question.tags.includes('answered')) {
        question.tags.push('answered');
      }
    } else {
      question.isAnswered = false;
      question.tags = question.tags.filter((t) => t !== 'answered');
    }
    await question.save();

    res.json({ answer, question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE an answer (requires admin or answer author)
router.delete('/:id/answers/:answerId', writeLimiter, requireAuth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    if (req.user.role !== 'admin' && req.user.username !== answer.username) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await Answer.findByIdAndDelete(req.params.answerId);

    // Recalculate question answered state
    const question = await Question.findById(req.params.id);
    if (question) {
      const hasLiked = await Answer.exists({ question: question._id, isLiked: true });
      if (hasLiked) {
        question.isAnswered = true;
        if (!question.tags.includes('answered')) {
          question.tags.push('answered');
        }
      } else {
        question.isAnswered = false;
        question.tags = question.tags.filter((t) => t !== 'answered');
      }
      await question.save();
    }

    res.json({ message: 'Answer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
