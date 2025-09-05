const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    branchCode: { type: String, required: true, unique: true },
    branchName: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Branch', branchSchema);