const HistoryOrder = require('../models/HistoryOrder');

const getAllBills = async (req, res) => {
    try {
        const { startDate, endDate, branchCode, billStatus, billType, billNumber, memberName, recordBy } = req.query;
        const query = {};

        // วันที่ปัจจุบันใน +07:00
        const today = new Date();
        today.setUTCHours(today.getUTCHours() - 7); // ปรับเป็น +07:00
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMilliseconds(tomorrow.getMilliseconds() - 1); // 23:59:59.999

        // ค่าเริ่มต้นเป็นวันนี้ถ้าไม่ระบุวันที่
        if (!startDate || !endDate) {
            query.createdAt = { $gte: today, $lte: tomorrow };
        } else {
            // ตรวจสอบและแปลงวันที่จาก Frontend (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                console.log('Invalid date format:', { startDate, endDate });
                return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0); // 00:00:00.000 ของวันเริ่ม
            end.setHours(23, 59, 59, 999); // 23:59:59.999 ของวันสิ้นสุด
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.log('Invalid Date object:', { start, end });
                return res.status(400).json({ message: 'Invalid date format' });
            }
            query.createdAt = { $gte: start, $lte: end };
        }

        // ตรวจสอบ branchCode สำหรับ Cashier
        if (req.user.role === 'Cashier') {
            if (!req.user.branchCode) {
                console.error('Cashier missing branchCode:', req.user);
                return res.status(400).json({ message: 'Cashier must have a valid branchCode' });
            }
            query.branchCode = req.user.branchCode;
        } else if (branchCode) {
            query.branchCode = branchCode;
        }

        if (billStatus) query.billStatus = billStatus;
        if (billType) query.purchaseType = billType;
        if (billNumber) query.billNumber = { $regex: billNumber, $options: 'i' };
        if (memberName) query.memberName = { $regex: memberName, $options: 'i' };
        if (recordBy) query.recordBy = { $regex: recordBy, $options: 'i' };

        console.log('All Bills Query:', JSON.stringify(query, null, 2));
        const bills = await HistoryOrder.find(query).sort({ createdAt: -1 });
        console.log('All Bills Result:', bills.length, 'bills found');

        res.json(bills);
    } catch (error) {
        console.error('Error in getAllBills:', error.message, error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSummary = async (req, res) => {
    try {
        const { startDate, endDate, recordBy } = req.query;
        const query = { billStatus: 'Completed' };

        // วันที่ปัจจุบันใน +07:00
        const today = new Date();
        today.setUTCHours(today.getUTCHours() - 7);
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMilliseconds(tomorrow.getMilliseconds() - 1);

        // ค่าเริ่มต้นเป็นวันนี้ถ้าไม่ระบุวันที่
        if (!startDate || !endDate) {
            query.createdAt = { $gte: today, $lte: tomorrow };
        } else {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                console.log('Invalid date format:', { startDate, endDate });
                return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0); // ปรับให้เริ่มต้นวัน
            end.setHours(23, 59, 59, 999); // ปรับให้สิ้นสุดวัน
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.log('Invalid Date object:', { start, end });
                return res.status(400).json({ message: 'Invalid date format' });
            }
            query.createdAt = { $gte: start, $lte: end };
        }

        // ตรวจสอบ branchCode สำหรับ Cashier
        if (req.user.role === 'Cashier') {
            if (!req.user.branchCode) {
                console.error('Cashier missing branchCode:', req.user);
                return res.status(400).json({ message: 'Cashier must have a valid branchCode' });
            }
            query.branchCode = req.user.branchCode;
        }

        if (recordBy) query.recordBy = { $regex: recordBy, $options: 'i' };

        console.log('Summary Query:', JSON.stringify(query, null, 2));
        const bills = await HistoryOrder.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        purchaseType: '$purchaseType',
                        branchCode: '$branchCode',
                        recordBy: '$recordBy',
                        date: { $dateToString: { format: '%Y-%m-%d %H:%M:%S', date: '$createdAt', timezone: '+07:00' } },
                    },
                    billAmount: { $sum: 1 },
                    totalPrice: { $sum: '$totalPrice' },
                },
            },
            {
                $project: {
                    billType: '$_id.purchaseType',
                    branchCode: '$_id.branchCode',
                    recordBy: '$_id.recordBy',
                    startDate: '$_id.date',
                    billAmount: 1,
                    totalPrice: 1,
                    _id: 0,
                },
            },
            { $sort: { startDate: -1 } },
        ]);

        console.log('Summary Bills Result:', bills.length, 'records found');
        const totalPriceSum = bills.reduce((sum, bill) => sum + bill.totalPrice, 0);
        res.json({ bills, totalPrice: totalPriceSum });
    } catch (error) {
        console.error('Error in getSummary:', error.message, error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const cancelBill = async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await HistoryOrder.findById(id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        if (bill.billStatus === 'Canceled') {
            return res.status(400).json({ message: 'Bill already canceled' });
        }
        bill.billStatus = 'Canceled';
        bill.cancelBy = req.user.username;
        bill.canceledDate = new Date();
        await bill.save();
        res.json({ message: 'Bill canceled successfully', bill });
    } catch (error) {
        console.error('Error in cancelBill:', error.message, error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllBills, getSummary, cancelBill };