
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// เฉพาะ Admin เท่านั้น
router.get('/', authMiddleware, roleMiddleware(['Admin']), userController.getAllUsers);
router.post('/', authMiddleware, roleMiddleware(['Admin']), userController.createUser);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), userController.deleteUser);

module.exports = router;
