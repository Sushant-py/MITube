const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT Token
const generateToken = (id, username) => {
    return jwt.sign(
        { id, username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Extended to 30 days so users don't get logged out constantly
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with that email or username' });
        }

        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create and save the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // 4. Generate token so they are instantly logged in after registering
        const token = generateToken(newUser._id, newUser.username);

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Check if this is a Google-only user
        if (!user.password) {
            return res.status(400).json({ message: 'Please sign in using Google' });
        }

        // 3. Compare the provided password with the hashed database password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 4. Generate the JWT
        const token = generateToken(user._id, user.username);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @route   POST /api/auth/google
// @desc    Google Sign-In & Registration
exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body; // The token sent from your React frontend
        
        // 1. Verify token with Google's servers
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const { email, name, picture, sub: googleId } = ticket.getPayload();

        // 2. Check if user already exists
        let user = await User.findOne({ email });
        
        // 3. If not, instantly create a new account for them!
        if (!user) {
            // Generate a username without spaces (e.g., "John Doe" -> "johndoe")
            let baseUsername = name.replace(/\s+/g, '').toLowerCase();
            let finalUsername = baseUsername;
            
            // Ensure the username is completely unique
            let userExists = await User.findOne({ username: finalUsername });
            let counter = 1;
            while(userExists) {
                finalUsername = `${baseUsername}${counter}`;
                userExists = await User.findOne({ username: finalUsername });
                counter++;
            }

            user = new User({ 
                username: finalUsername, 
                email, 
                googleId, 
                avatar: picture 
            });
            await user.save();
        }

        // 4. Generate the JWT
        const token = generateToken(user._id, user.username);

        res.status(200).json({
            message: 'Google Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: 'Google Authentication Failed' });
    }
};