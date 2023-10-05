const { verifyToken } = require('./aunt.js');

const authMiddleware = (req, res, next) => {
    const token = req.params.token;
    try {
        const data = verifyToken(token);
        if (data.role === 'Construction Worker') {
            next();
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error: Invalid token" });
    }
};

module.exports = authMiddleware;