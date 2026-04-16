const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByBook,
  deleteReview
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Публичный
router.get('/books/:id/reviews', getReviewsByBook);

// Защищённые
router.post('/books/:id/reviews', authMiddleware, createReview);
router.delete('/reviews/:id', authMiddleware, deleteReview);

module.exports = router;
