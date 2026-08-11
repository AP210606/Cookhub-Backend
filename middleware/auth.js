// backend/middleware/auth.js (No changes needed, but added minor logging for debugging token issues)
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('Auth middleware: No Authorization header provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request (ensure 'id' and 'role' are in payload)
    console.log('Auth middleware: Token decoded successfully for user ID:', decoded.id, 'Role:', decoded.role); // Debug log
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};