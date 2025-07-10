const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  displayName: String,
  email: String,
  password: String,
  avatar: String,
  status: { type: String, default: "Hey there! I am using ChatApp" }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
