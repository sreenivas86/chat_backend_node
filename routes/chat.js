const express = require('express');
const router = express.Router();
const { accessPrivateChat, getChats, createGroupChat } = require('../controllers/chatController');
const protect = require('../middlewares/authMiddleware');

router.post('/private', protect, accessPrivateChat);
router.get('/', protect, getChats);
router.post('/group', protect, createGroupChat);

module.exports = router;
