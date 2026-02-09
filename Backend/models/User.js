const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  
  // Role System
  role: { 
    type: String, 
    default: 'user', 
    enum: ['user', 'admin'] 
  },

  // ✅ NEW: PASSWORD RESET FIELDS
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Streak System
  streak: { type: Number, default: 0 },
  lastTaskDate: { type: Date, default: null },
  isStreakFrozen: { type: Boolean, default: false },
  totalTasksCompleted: { type: Number, default: 0 },

  // Pixel Pet System
  pet: {
    name: { type: String, default: "Rocky" },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    stage: { type: Number, default: 1 }, 
    mood: { type: String, default: "happy" },
    evolutionName: { type: String, default: "Mystery Egg" }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);