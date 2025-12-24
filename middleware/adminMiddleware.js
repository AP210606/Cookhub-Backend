// cookhub-backend/middleware/adminMiddleware.js
const authorizeAdmin = (req, res, next) => {
    // req.user is populated by the protect middleware
    if (req.user && (req.user.role === 'admin' || req.user.role === 'coordinator')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin or coordinator' });
    }
};

module.exports = { authorizeAdmin };