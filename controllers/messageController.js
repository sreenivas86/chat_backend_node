const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const sendMessage = async (req, res) => {
  const { chatRoomId, text, replyTo, mentions } = req.body;
  const sender = req.user.id;

  if (!chatRoomId || (!text && (!req.files || req.files.length === 0))) {
    return res.status(400).json({ message: 'Message content or attachment is required' });
  }

  // Build attachments array if files exist
  const attachments = (req.files || []).map(file => ({
    fileType: file.mimetype.startsWith('image') ? 'image' : 'pdf',
    fileName: file.originalname,
    fileUrl: `/uploads/chat/${file.filename}`
  }));

  try {
    // Save message
    const newMessage = new Message({
      chatRoom: chatRoomId,
      sender,
      text,
      attachments,
      replyTo,
      mentions
    });
    await newMessage.save();

    // Update chat room's last message
    await ChatRoom.findByIdAndUpdate(chatRoomId, { lastMessage: newMessage._id });

    // Populate full message
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username displayName avatar')
      .populate('replyTo')
      .populate('mentions', 'username displayName');

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

const getMessages = async (req, res) => {
  const { chatRoomId } = req.params;

  try {
    const messages = await Message.find({ chatRoom: chatRoomId })
      .populate('sender', 'username displayName avatar')
      .populate('replyTo')
      .populate('mentions', 'username displayName')
      .sort({ createdAt: 1 })
      .lean(); // use lean for better read performance if no need for doc methods

    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

const markAsSeen = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const hasSeen = msg.seenBy.some(id => id.toString() === userId.toString());
    if (!hasSeen) {
      msg.seenBy.push(userId);
      await msg.save();
    }

    res.json({ message: 'Marked as seen' });
  } catch (err) {
    console.error('markAsSeen error:', err.message);
    res.status(500).json({ message: 'Error marking as seen', error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsSeen
};
