const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.get('/all-bills', authMiddleware, roleMiddleware(['Admin', 'Cashier']), reportController.getAllBills);
router.get('/summary', authMiddleware, roleMiddleware(['Admin', 'Cashier']), reportController.getSummary);
router.post('/cancel/:id', authMiddleware, roleMiddleware(['Admin']), reportController.cancelBill);

module.exports = router;