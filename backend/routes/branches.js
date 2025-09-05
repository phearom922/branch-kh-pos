const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// เฉพาะ Admin เท่านั้น
router.get('/', authMiddleware, roleMiddleware(['Admin', 'Cashier']), branchController.getAllBranches);
router.post('/', authMiddleware, roleMiddleware(['Admin']), branchController.createBranch);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), branchController.updateBranch);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), branchController.deleteBranch);

module.exports = router;