const Category = require('../models/Category');
const Product = require('../models/Product');

const getAllCategories = async (req, res) => {
    try {
        const { groupId } = req.query;
        const query = {};
        if (groupId) {
            query.groupId = groupId;
        }
        const categories = await Category.find(query)
            .populate('groupId', 'groupName')
            .sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        console.error('Error in getAllCategories:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createCategory = async (req, res) => {
    const { categoryName, groupId } = req.body;
    try {
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        const category = new Category({ categoryName, groupId });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error in createCategory:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName, groupId, status } = req.body;
    try {
        const existingCategory = await Category.findOne({ categoryName, _id: { $ne: id } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        const category = await Category.findByIdAndUpdate(id, { categoryName, groupId, status, updatedAt: new Date() }, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Error in updateCategory:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const products = await Product.find({ categoryId: id });
        if (products.length > 0) {
            return res.status(400).json({ message: 'Cannot delete category with associated products' });
        }
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error in deleteCategory:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
