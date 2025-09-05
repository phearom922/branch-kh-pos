const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const multer = require('multer');

// ตั้งค่า storage สำหรับ multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// จำกัดประเภทไฟล์
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('ไฟล์ต้องเป็น .xlsx หรือ .xls'), false);
    }
};

// ตั้งค่า multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
});

router.get('/', authMiddleware, roleMiddleware(['Admin']), productController.getAllProducts);
router.post('/', authMiddleware, roleMiddleware(['Admin']), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), productController.deleteProduct);
router.post('/import', authMiddleware, roleMiddleware(['Admin']), upload.single('file'), productController.importProducts);

module.exports = router;