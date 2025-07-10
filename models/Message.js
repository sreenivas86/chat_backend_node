const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  fileType: { type: String, enum: ['image', 'pdf'], required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }
}, { _id: false }); // prevents auto-generating _id for sub-documents

const MessageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  attachments: [AttachmentSchema],

  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },

  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  seenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
