const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId || !decoded.role || !decoded.branchCode) {
            return res.status(400).json({ message: 'Invalid token: missing required fields' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in authMiddleware:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;