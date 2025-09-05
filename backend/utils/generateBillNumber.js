const mongoose = require('mongoose');
const Counter = require('../models/Counter');

async function generateBillNumber(purchaseType, branchCode) {
    const counterId = `billNumber_${purchaseType}_${branchCode}`;
    const counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { sequence: 1 } },
        { upsert: true, new: true }
    );
    return `${purchaseType}-${branchCode}-${counter.sequence.toString().padStart(8, '0')}`;
}

module.exports = { generateBillNumber };