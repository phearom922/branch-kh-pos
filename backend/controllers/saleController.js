
const Product = require('../models/Product');
const HistoryOrder = require('../models/HistoryOrder');
const { generateBillNumber } = require('../utils/generateBillNumber');

const getProducts = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 15, categoryId = '', groupId = '', sortBy = 'productCode', sortOrder = 'asc' } = req.query;
        const query = { status: 'Active' };
        if (search) {
            query.$or = [
                { productCode: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } },
            ];
        }
        if (categoryId) {
            query.categoryId = categoryId;
        }
        if (groupId) {
            query.groupId = groupId;
        }
        console.log('Query:', query);
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1; // กำหนดทิศทางการเรียงลำดับ
        const products = await Product.find(query)
            .populate('categoryId', 'categoryName')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort(sort); // ใช้ object sort แบบไดนามิก
        const total = await Product.countDocuments(query);
        res.json({ products, total });
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const createSale = async (req, res) => {
    const { memberId, memberName, purchaseType, items } = req.body;
    try {
        if (!memberId || !memberName || !purchaseType || !items || items.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        for (const item of items) {
            const product = await Product.findOne({ productCode: item.productCode });
            if (!product) {
                return res.status(400).json({ message: `Product ${item.productCode} not found` });
            }
            if (item.amount <= 0) {
                return res.status(400).json({ message: 'Amount must be greater than 0' });
            }
        }
        const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalPV = items.reduce((sum, item) => sum + item.totalPV, 0);
        const billNumber = await generateBillNumber(purchaseType, req.user.branchCode);
        const order = new HistoryOrder({
            billNumber,
            memberId,
            memberName,
            purchaseType,
            branchCode: req.user.branchCode,
            items,
            totalPrice,
            totalPV,
            recordBy: req.user.username,
        });
        await order.save();
        res.status(201).json({ message: 'Sale created successfully', order }); // ส่ง order พร้อม billNumber กลับไป
    } catch (error) {
        console.error('Error in createSale:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getProducts, createSale };
