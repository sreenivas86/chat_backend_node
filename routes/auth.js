const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const protect = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});


module.exports = router;
