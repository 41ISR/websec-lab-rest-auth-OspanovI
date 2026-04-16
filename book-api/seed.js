require('dotenv').config();
const db = require('./src/db');
const { hashPassword } = require('./src/auth');

db.exec(`
  DELETE FROM reviews;
  DELETE FROM books;
  DELETE FROM users;
  DELETE FROM sqlite_sequence WHERE name IN ('users', 'books', 'reviews');
`);

const insertUser = db.prepare(`
  INSERT INTO users (username, email, password, role)
  VALUES (?, ?, ?, ?)
`);

const admin = insertUser.run('admin', 'admin@example.com', hashPassword('qwerty123'), 'admin');
const user = insertUser.run('user', 'user@example.com', hashPassword('qwerty123'), 'user');

const adminId = admin.lastInsertRowid;
const userId = user.lastInsertRowid;

console.log('Созданы пользователи: admin (id=' + adminId + '), user (id=' + userId + ')');

const insertBook = db.prepare(`
  INSERT INTO books (title, author, year, genre, description, createdBy)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const books = [
  { title: 'Мастер и Маргарита', author: 'Михаил Булгаков', year: 1967, genre: 'Роман', description: 'Мистический роман о визите дьявола в Москву.', createdBy: adminId },
  { title: 'Преступление и наказание', author: 'Фёдор Достоевский', year: 1866, genre: 'Роман', description: 'История о молодом человеке, совершившем убийство.', createdBy: userId },
  { title: 'Война и мир', author: 'Лев Толстой', year: 1869, genre: 'Роман-эпопея', description: 'Жизнь русского общества в период наполеоновских войн.', createdBy: adminId },
  { title: '1984', author: 'Джордж Оруэлл', year: 1949, genre: 'Антиутопия', description: 'Тоталитарное будущее, где Большой Брат следит за всеми.', createdBy: userId },
  { title: 'Гарри Поттер и философский камень', author: 'Дж. К. Роулинг', year: 1997, genre: 'Фэнтези', description: 'Мальчик узнаёт, что он волшебник.', createdBy: adminId }
];

const bookIds = [];
books.forEach(book => {
  const result = insertBook.run(book.title, book.author, book.year, book.genre, book.description, book.createdBy);
  bookIds.push(result.lastInsertRowid);
});

console.log('Добавлено 5 книг');

const insertReview = db.prepare(`
  INSERT INTO reviews (bookId, userId, rating, comment)
  VALUES (?, ?, ?, ?)
`);

const reviews = [
  { bookId: bookIds[0], userId: userId, rating: 5, comment: 'Потрясающая книга, перечитываю каждый год!' },
  { bookId: bookIds[1], userId: adminId, rating: 4, comment: 'Глубокое философское произведение.' },
  { bookId: bookIds[2], userId: userId, rating: 5, comment: 'Эпический масштаб, великолепные персонажи.' },
  { bookId: bookIds[3], userId: adminId, rating: 5, comment: 'Актуально и сегодня. Страшное предупреждение.' },
  { bookId: bookIds[4], userId: userId, rating: 4, comment: 'Отличное начало серии, захватывает.' }
];

reviews.forEach(r => {
  insertReview.run(r.bookId, r.userId, r.rating, r.comment);
});

console.log('Добавлено 5 отзывов');
console.log('Готово! База данных заполнена.');
