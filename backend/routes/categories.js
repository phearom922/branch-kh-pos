
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['Admin', 'Cashier']), categoryController.getAllCategories);
router.post('/', authMiddleware, roleMiddleware(['Admin']), categoryController.createCategory);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), categoryController.updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), categoryController.deleteCategory);

module.exports = router;
