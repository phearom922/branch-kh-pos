const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Admin และ Cashier เข้าถึงได้
router.get('/products', authMiddleware, saleController.getProducts);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Cashier']), saleController.createSale);

module.exports = router;