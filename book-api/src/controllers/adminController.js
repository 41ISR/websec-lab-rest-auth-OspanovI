const db = require('../db');

function getAllUsers(req, res) {
  const users = db.prepare('SELECT id, username, email, role, createdAt FROM users').all();
  res.json(users);
}

function deleteUser(req, res) {
  const userId = parseInt(req.params.id);
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  if (req.user.id === userId) {
    return res.status(400).json({ message: 'Нельзя удалить самого себя' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ message: 'Пользователь удалён' });
}

module.exports = {
  getAllUsers,
  deleteUser
};
