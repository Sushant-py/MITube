const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // Strip out 'Bearer ' if it's there
        const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'fallback_secret');
        
        // Fix: If the token payload has a 'user' object, use it. 
        // Otherwise, assume the payload itself is the user object.
        req.user = decoded.user || decoded;
        
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;