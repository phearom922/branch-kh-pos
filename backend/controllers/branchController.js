const Branch = require('../models/Branch');

const getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find({}).sort({ createdAt: -1 });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createBranch = async (req, res) => {
    const { branchCode, branchName, address } = req.body;
    try {
        if (!branchCode || !branchName || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingBranch = await Branch.findOne({ branchCode });
        if (existingBranch) {
            return res.status(400).json({ message: 'Branch code already exists' });
        }
        const branch = new Branch({ branchCode, branchName, address });
        await branch.save();
        res.status(201).json({ message: 'Branch created successfully', branch });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBranch = async (req, res) => {
    const { id } = req.params;
    const { branchCode, branchName, address, status } = req.body;
    try {
        const existingBranch = await Branch.findOne({ branchCode, _id: { $ne: id } });
        if (existingBranch) {
            return res.status(400).json({ message: 'Branch code already exists' });
        }
        const branch = await Branch.findByIdAndUpdate(
            id,
            { branchCode, branchName, address, status, updatedAt: Date.now() },
            { new: true }
        );
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        res.json({ message: 'Branch updated successfully', branch });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteBranch = async (req, res) => {
    const { id } = req.params;
    try {
        const branch = await Branch.findById(id);
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        if (branch.status === 'Active') {
            return res.status(400).json({ message: 'Cannot delete active branch' });
        }
        await Branch.findByIdAndDelete(id);
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllBranches, createBranch, updateBranch, deleteBranch };
