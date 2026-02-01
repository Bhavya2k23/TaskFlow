const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  
  // Streak System
  streak: { type: Number, default: 0 },
  lastTaskDate: { type: Date, default: null },
  isStreakFrozen: { type: Boolean, default: false },
  totalTasksCompleted: { type: Number, default: 0 },

  // 🐉 PIXEL PET SYSTEM (NEW)
  pet: {
    name: { type: String, default: "Rocky" },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    stage: { type: Number, default: 1 }, // 1: Egg, 2: Baby, 3: Teen, 4: Adult
    mood: { type: String, default: "happy" }, // happy, sad, sleeping
    evolutionName: { type: String, default: "Mystery Egg" }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);