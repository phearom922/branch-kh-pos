const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Branch = require('../models/Branch');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role, branchCode: user.branchCode },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        // ดึงข้อมูล Branch
        const branch = await Branch.findOne({ branchCode: user.branchCode });
        const userWithBranch = {
            username: user.username,
            role: user.role,
            branchCode: user.branchCode,
            lastName: user.lastName,
            branchName: branch ? branch.branchName : 'Unknown Branch',
            address: branch ? branch.address : 'Unknown Address',
        };
        res.json({ token, user: userWithBranch });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('username role branchCode lastName');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // ดึงข้อมูล Branch
        const branch = await Branch.findOne({ branchCode: user.branchCode });
        const userWithBranch = {
            username: user.username,
            role: user.role,
            branchCode: user.branchCode,
            lastName: user.lastName,
            branchName: branch ? branch.branchName : 'Unknown Branch',
            address: branch ? branch.address : 'Unknown Address',
        };
        res.json({ user: userWithBranch });
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, getMe };