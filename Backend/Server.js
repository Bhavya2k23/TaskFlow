const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // ✅ Required
const { Server } = require('socket.io'); // ✅ Required

// Routes Import
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const syllabusRoutes = require('./routes/syllabusRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/ai', aiRoutes);

// ⚔️ SOCKET.IO SERVER SETUP
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join Room
  socket.on("join_room", (data) => {
    socket.join(data.room);
    socket.to(data.room).emit("user_joined", data.username);
  });

  // Start Battle
  socket.on("start_battle", (room) => {
    io.in(room).emit("battle_started");
  });

  // Player Lost Focus (Tab Switch)
  socket.on("player_lost_focus", (data) => {
    // Notify opponent they won
    socket.to(data.room).emit("game_over", { winner: "Opponent", reason: "Opponent switched tabs!" });
    // Notify self they lost
    socket.emit("game_over", { winner: "Opponent", reason: "You switched tabs! Defeat." });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // ✅ Changed to server.listen