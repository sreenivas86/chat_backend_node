const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Track joined rooms (optional debug)
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`✅ User ${socket.id} joined room: ${roomId}`);
      console.log('📦 Current rooms for socket:', [...socket.rooms]);
    });

    // Handle send message
    socket.on('sendMessage', async (data) => {
      const { chatRoomId, text, senderId, replyTo, mentions, attachments } = data;

      try {
        // 1. Save the message
        const message = new Message({
          chatRoom: chatRoomId,
          sender: senderId,
          text,
          attachments,
          replyTo,
          mentions
        });

        await message.save();

        // 2. Update lastMessage in ChatRoom
        await ChatRoom.findByIdAndUpdate(chatRoomId, { lastMessage: message._id });

        // 3. Populate message details
        const fullMessage = await Message.findById(message._id)
          .populate('sender', 'username displayName avatar')
          .populate('replyTo')
          .populate('mentions', 'username displayName');

        // 4. Confirm the user is in the room
        const roomSet = io.sockets.adapter.rooms.get(chatRoomId);
        const roomUserCount = roomSet ? roomSet.size : 0;

        console.log(`📨 Emitting message to room: ${chatRoomId} (${roomUserCount} users)`);

        // 5. Emit to room
        io.to(chatRoomId).emit('newMessage', fullMessage);

      } catch (err) {
        console.error('💥 Error in sendMessage:', err.message);
        socket.emit('errorMessage', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};
