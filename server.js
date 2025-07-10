require('dotenv').config();
const express = require('express');
const http = require('http');

const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes (auth, chat, messages)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/message', require('./routes/message'));
app.use('/api',require('./routes/user'))

// Socket.IO logic
require('./socket')(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
