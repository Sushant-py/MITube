const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // 1. Get the token from the Authorization header (Format: "Bearer <token>")
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the decoded user payload (id, username) to the request object
        req.user = decoded;
        next(); // Move on to the actual controller
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };