const db = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../auth');


function register(req, res) {
  const { username, email, password } = req.body;


  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const hashed = hashPassword(password);
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, 'user')
    `);
    const result = stmt.run(username, email, hashed);

    const newUser = db.prepare('SELECT id, username, email, role, createdAt FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(newUser);

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  res.json({ user: userWithoutPassword, token });
}

function profile(req, res) {

  const { password, ...user } = req.user;
  res.json(user);
}

module.exports = { register, login, profile };
