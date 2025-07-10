const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');

// 🔹 Access (or create) a private 1-to-1 chat
exports.accessPrivateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user.id;

    if (!userId || userId === myId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if private chat already exists
    let chat = await ChatRoom.findOne({
      isGroup: false,
      members: { $all: [myId, userId], $size: 2 }
    })
      .populate('members', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username displayName avatar' }
      });

    // If not found, create a new one
    if (!chat) {
      chat = await ChatRoom.create({
        isGroup: false,
        members: [myId, userId]
      });

      chat = await chat
        .populate('members', '-password')
        .execPopulate?.(); // for Mongoose <7
    }

    return res.status(200).json(chat);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to access chat', error: err.message });
  }
};

// 🔹 Get all chats for current user
exports.getChats = async (req, res) => {
  try {
    const myId = req.user.id;

    const chats = await ChatRoom.find({ members: myId })
      .populate('members', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username displayName avatar' }
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json(chats);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching chats', error: err.message });
  }
};

// 🔹 Create a group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, members } = req.body;
    const myId = req.user.id;

    if (!name || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({
        message: 'Group name and at least 2 members (excluding yourself) are required'
      });
    }

    const groupChat = await ChatRoom.create({
      name,
      isGroup: true,
      members: [...members, myId],
      admins: [myId]
    });

    const fullChat = await ChatRoom.findById(groupChat._id)
      .populate('members', '-password')
      .populate('admins', '-password');

    return res.status(201).json(fullChat);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating group chat', error: err.message });
  }
};
