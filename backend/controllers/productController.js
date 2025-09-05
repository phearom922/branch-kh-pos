const fs = require('fs').promises;
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Group = require('../models/Group');
const Category = require('../models/Category');
const xlsx = require('xlsx');


const getAllProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 15, categoryId, groupId, all, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { productCode: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
      ];
    }

    if (!all) {
      if (!groupId) {
        return res.status(400).json({ message: 'ต้องระบุ groupId' });
      }
      let groupIdObj;
      if (mongoose.Types.ObjectId.isValid(groupId)) {
        groupIdObj = mongoose.Types.ObjectId(groupId);
      } else {
        return res.status(400).json({ message: 'รูปแบบ groupId ไม่ถูกต้อง' });
      }
      query.groupId = groupIdObj;
    }

    if (categoryId && categoryId !== 'undefined' && categoryId !== '' && categoryId !== 'null') {
      query.categoryId = categoryId;
    }

    if (status) {
      query.status = status; // เพิ่มการกรองตามสถานะ
    }

    const parsedLimit = parseInt(limit) || 0;
    const products = await Product.find(query)
      .populate('categoryId', 'categoryName')
      .populate('groupId', 'groupName')
      .skip((page - 1) * parsedLimit)
      .limit(parsedLimit)
      .sort({ productCode: 1 });

    const total = await Product.countDocuments(query);
    console.log('Products returned:', products.length, 'Total count:', total);
    res.json({ products, total });
  } catch (error) {
    console.error('Error in getAllProducts:', error.message, error.stack);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const createProduct = async (req, res) => {
  const { productCode, productName, groupId, categoryId, pv, unitPrice } = req.body;
  try {
    const existingProduct = await Product.findOne({ productCode });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product code already exists' });
    }
    const product = new Product({ productCode, productName, groupId, categoryId, pv, unitPrice });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error in createProduct:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { productCode, productName, groupId, categoryId, pv, unitPrice, status } = req.body;
  try {
    const existingProduct = await Product.findOne({ productCode, _id: { $ne: id } });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product code already exists' });
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { productCode, productName, groupId, categoryId, pv, unitPrice, status, updatedAt: new Date() },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error in updateProduct:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProduct:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ไม่มีไฟล์อัปโหลด" });
    }

    // อ่านไฟล์ Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // ตรวจสอบคอลัมน์ที่ต้องการ
    const requiredHeaders = ["productCode", "productName", "groupName", "categoryName", "pv", "unitPrice"];
    const headers = Object.keys(rows[0] || {});
    for (let h of requiredHeaders) {
      if (!headers.includes(h)) {
        await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
        return res.status(400).json({ message: `ขาดคอลัมน์ที่ต้องการ: ${h}` });
      }
    }

    // ตัดช่องว่างและกรองแถว
    let skippedRows = 0;
    const debugRows = [];
    const validRows = rows.map((row, i) => {
      const trimmedRow = {
        productCode: (row.productCode || "").toString().trim(),
        productName: (row.productName || "").toString().trim(),
        groupName: (row.groupName || "").toString().trim(),
        categoryName: (row.categoryName || "").toString().trim(),
        pv: Number(row.pv) || 0,
        unitPrice: Number(row.unitPrice) || 0,
      };
      debugRows.push({ i: i + 2, ...trimmedRow });
      return trimmedRow;
    }).filter(row => {
      const valid = row.groupName && row.categoryName && row.productCode && row.productName;
      if (!valid) {
        debugRows.find(r => r.i === i + 2).error = `Missing required field: ${!row.groupName ? 'groupName' : !row.categoryName ? 'categoryName' : !row.productCode ? 'productCode' : 'productName'}`;
        skippedRows++;
      }
      return valid;
    });

    console.log('Excel import debugRows:', debugRows);
    const emptyRows = debugRows.filter(r => r.error);
    if (emptyRows.length > 0) {
      console.log('Rows with errors:', emptyRows);
    }

    if (validRows.length === 0) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
      return res.status(400).json({ message: 'ไม่มีแถวที่ถูกต้องสำหรับนำเข้า', skippedRows, errors: emptyRows });
    }

    const products = [];
    for (const row of validRows) {
      const { productCode, productName, groupName, categoryName, pv, unitPrice } = row;

      // ตรวจสอบ productCode ที่ซ้ำ
      const existingProduct = await Product.findOne({ productCode });
      if (existingProduct) {
        debugRows.find(r => r.productCode === productCode).error = 'Product code already exists';
        skippedRows++;
        continue;
      }

      // ค้นหาหรือสร้าง Group
      let group = await Group.findOne({ groupName });
      if (!group) {
        if (!groupName) {
          debugRows.find(r => r.productCode === productCode).error = 'Invalid groupName';
          skippedRows++;
          continue;
        }
        group = new Group({ groupName });
        await group.save();
      }

      // ค้นหาหรือสร้าง Category
      let category = await Category.findOne({ categoryName });
      if (!category) {
        if (!categoryName) {
          debugRows.find(r => r.productCode === productCode).error = 'Invalid categoryName';
          skippedRows++;
          continue;
        }
        category = new Category({ categoryName });
        await category.save();
      }

      const product = new Product({
        productCode,
        productName,
        groupId: group._id,
        categoryId: category._id,
        pv: Number(pv),
        unitPrice: Number(unitPrice),
      });

      await product.save();
      products.push(product);
    }

    await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    res.json({
      message: `นำเข้าสินค้าสำเร็จ`,
      imported: products.length,
      skippedRows,
      errors: debugRows.filter(r => r.error),
      products,
    });
  } catch (error) {
    console.error("Error importing products:", error);
    await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการนำเข้าสินค้า", error: error.message });
  }
};


module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct, importProducts };
