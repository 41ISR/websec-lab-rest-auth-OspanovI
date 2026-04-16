const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Защищённые маршруты
router.post('/', authMiddleware, createBook);
router.put('/:id', authMiddleware, updateBook);
router.delete('/:id', authMiddleware, deleteBook);

module.exports = router;
