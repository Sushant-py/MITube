const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin } = require('../controllers/authcontrollers');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin); // <-- Your new Google route

module.exports = router;