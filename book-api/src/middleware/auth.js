const db = require('../db');
const { verifyToken } = require('../auth');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
  if (!user) {
    return res.status(401).json({ message: 'Пользователь не найден' });
  }

  req.user = user;
  next();
}

module.exports = authMiddleware;
