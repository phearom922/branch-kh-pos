const mongoose = require('mongoose');

const historyOrderSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  purchaseType: { type: String, required: true },
  items: [
    {
      productCode: { type: String, required: true },
      productName: { type: String, required: true },
      unitPrice: { type: Number, required: true },
      pv: { type: Number, required: true },
      amount: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      totalPV: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  totalPV: { type: Number, required: true },
  branchCode: { type: String, required: true },
  billStatus: { type: String, required: true, default: 'Completed' },
  recordBy: { type: String, required: true },
  cancelBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  canceledDate: { type: Date },
});

module.exports = mongoose.model('HistoryOrder', historyOrderSchema);