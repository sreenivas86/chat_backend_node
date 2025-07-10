const protect = require('../middlewares/authMiddleware');
const User = require('../models/User');

// GET /api/users
const router= require('express').Router();

router.get('/users', protect, async (req, res) => {
  const users = await User.find().select('_id displayName');
  res.json(users);
});
module.exports=router;