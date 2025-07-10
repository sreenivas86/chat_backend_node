const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const protect = require('../middlewares/authMiddleware');
const {
  sendMessage,
  getMessages,
  markAsSeen
} = require('../controllers/messageController');

router.post('/send', protect, upload.array('attachments'), sendMessage);
router.get('/:chatRoomId', protect, getMessages);
router.put('/seen/:messageId', protect, markAsSeen);

module.exports = router;
