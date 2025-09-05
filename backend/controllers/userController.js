
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Branch = require('../models/Branch');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        const usersWithBranch = await Promise.all(users.map(async (user) => {
            const branch = await Branch.findOne({ branchCode: user.branchCode });
            return {
                ...user.toObject(),
                branchName: branch ? branch.branchName : 'Unknown Branch',
                address: branch ? branch.address : 'Unknown Address',
            };
        }));
        res.json(usersWithBranch);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    const { username, lastName, password, role, branchCode } = req.body;
    try {
        if (!username || !lastName || !password || !role || !branchCode) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const branch = await Branch.findOne({ branchCode });
        if (!branch) {
            return res.status(400).json({ message: 'Invalid branch code' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, lastName, password: hashedPassword, role, branchCode });
        await user.save();
        res.status(201).json({
            message: 'User created successfully',
            user: {
                username,
                lastName,
                role,
                branchCode,
                branchName: branch.branchName,
                address: branch.address,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, lastName, password, role, branchCode, status } = req.body;
    try {
        const existingUser = await User.findOne({ username, _id: { $ne: id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const branch = await Branch.findOne({ branchCode });
        if (!branch) {
            return res.status(400).json({ message: 'Invalid branch code' });
        }
        const updateData = { username, lastName, role, branchCode, status, updatedAt: Date.now() };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.status === 'Active') {
            return res.status(400).json({ message: 'Cannot delete active user' });
        }
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
