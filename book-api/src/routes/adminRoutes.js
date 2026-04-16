const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { checkRole } = require('../middleware/roles');

// Все маршруты требуют аутентификации и роли admin
router.use(authMiddleware);
router.use(checkRole('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
