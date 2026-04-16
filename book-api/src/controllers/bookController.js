const db = require('../db');

function getAllBooks(req, res) {
  const { genre, author } = req.query;
  let query = `
    SELECT books.*, users.username as addedByUsername
    FROM books
    JOIN users ON books.createdBy = users.id
  `;
  const conditions = [];
  const params = [];

  if (genre) {
    conditions.push('books.genre LIKE ?');
    params.push(`%${genre}%`);
  }
  if (author) {
    conditions.push('books.author LIKE ?');
    params.push(`%${author}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY books.createdAt DESC';

  const books = db.prepare(query).all(...params);
  res.json(books);
}

function getBookById(req, res) {
  const { id } = req.params;
  const book = db.prepare(`
    SELECT books.*, users.username as addedByUsername
    FROM books
    JOIN users ON books.createdBy = users.id
    WHERE books.id = ?
  `).get(id);

  if (!book) {
    return res.status(404).json({ message: 'Книга не найдена' });
  }

  const reviews = db.prepare(`
    SELECT reviews.*, users.username as reviewer
    FROM reviews
    JOIN users ON reviews.userId = users.id
    WHERE reviews.bookId = ?
    ORDER BY reviews.createdAt DESC
  `).all(id);

  res.json({ ...book, reviews });
}

function createBook(req, res) {
  const { title, author, year, genre, description } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Название и автор обязательны' });
  }

  const stmt = db.prepare(`
    INSERT INTO books (title, author, year, genre, description, createdBy)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(title, author, year, genre, description, req.user.id);

  const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newBook);
}

function updateBook(req, res) {
  const { id } = req.params;
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!book) {
    return res.status(404).json({ message: 'Книга не найдена' });
  }

  if (req.user.role !== 'admin' && req.user.id !== book.createdBy) {
    return res.status(403).json({ message: 'Нет прав на редактирование этой книги' });
  }

  const { title, author, year, genre, description } = req.body;
  const stmt = db.prepare(`
    UPDATE books SET
      title = COALESCE(?, title),
      author = COALESCE(?, author),
      year = COALESCE(?, year),
      genre = COALESCE(?, genre),
      description = COALESCE(?, description)
    WHERE id = ?
  `);
  stmt.run(title, author, year, genre, description, id);

  const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  res.json(updatedBook);
}

function deleteBook(req, res) {
  const { id } = req.params;
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!book) {
    return res.status(404).json({ message: 'Книга не найдена' });
  }

  if (req.user.role !== 'admin' && req.user.id !== book.createdBy) {
    return res.status(403).json({ message: 'Нет прав на удаление этой книги' });
  }

  db.prepare('DELETE FROM books WHERE id = ?').run(id);
  res.json({ message: 'Книга удалена' });
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
