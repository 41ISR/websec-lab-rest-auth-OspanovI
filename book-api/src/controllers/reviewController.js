const db = require('../db');

function createReview(req, res) {
  const bookId = parseInt(req.params.id);
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Оценка должна быть от 1 до 5' });
  }

  const book = db.prepare('SELECT id FROM books WHERE id = ?').get(bookId);
  if (!book) {
    return res.status(404).json({ message: 'Книга не найдена' });
  }

  const stmt = db.prepare(`
    INSERT INTO reviews (bookId, userId, rating, comment)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(bookId, req.user.id, rating, comment || '');

  const review = db.prepare(`
    SELECT reviews.*, users.username as reviewer
    FROM reviews
    JOIN users ON reviews.userId = users.id
    WHERE reviews.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(review);
}

function getReviewsByBook(req, res) {
  const bookId = parseInt(req.params.id);
  const reviews = db.prepare(`
    SELECT reviews.*, users.username as reviewer
    FROM reviews
    JOIN users ON reviews.userId = users.id
    WHERE reviews.bookId = ?
    ORDER BY reviews.createdAt DESC
  `).all(bookId);

  res.json(reviews);
}

function deleteReview(req, res) {
  const reviewId = parseInt(req.params.id);
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
  if (!review) {
    return res.status(404).json({ message: 'Отзыв не найден' });
  }

  if (req.user.role !== 'admin' && req.user.id !== review.userId) {
    return res.status(403).json({ message: 'Нет прав на удаление этого отзыва' });
  }

  db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId);
  res.json({ message: 'Отзыв удален' });
}

module.exports = {
  createReview,
  getReviewsByBook,
  deleteReview
};
