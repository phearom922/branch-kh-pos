
const Group = require('../models/Group');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        console.error('Error in getAllGroups:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createGroup = async (req, res) => {
    const { groupName } = req.body;
    try {
        const existingGroup = await Group.findOne({ groupName });
        if (existingGroup) {
            return res.status(400).json({ message: 'Group name already exists' });
        }
        const group = new Group({ groupName });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error('Error in createGroup:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { groupName, status } = req.body;
    try {
        const existingGroup = await Group.findOne({ groupName, _id: { $ne: id } });
        if (existingGroup) {
            return res.status(400).json({ message: 'Group name already exists' });
        }
        const group = await Group.findByIdAndUpdate(id, { groupName, status, updatedAt: new Date() }, { new: true });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json(group);
    } catch (error) {
        console.error('Error in updateGroup:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await Category.find({ groupId: id });
        if (categories.length > 0) {
            const products = await Product.find({ groupId: id });
            if (products.length > 0) {
                return res.status(400).json({ message: 'Cannot delete group with associated categories and products' });
            }
            return res.status(400).json({ message: 'Cannot delete group with associated categories' });
        }
        const group = await Group.findByIdAndDelete(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error in deleteGroup:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllGroups, createGroup, updateGroup, deleteGroup };
