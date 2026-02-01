const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// 1. Create New Task
router.post('/', async (req, res) => {
  try {
    const newTask = await Task.create({
      user: req.body.userId,
      title: req.body.title
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get All Tasks for a User
router.get('/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Delete Task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. ACTIVITY HEATMAP DATA (Long Term History)
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Sirf Completed tasks chahiye jinki updated date ho
    const tasks = await Task.find({ 
        user: userId, 
        isCompleted: true 
    }).select('updatedAt'); 

    // Date wise grouping
    const map = {};
    tasks.forEach(t => {
        const date = t.updatedAt.toISOString().split('T')[0]; // YYYY-MM-DD
        map[date] = (map[date] || 0) + 1;
    });

    // Array format for Frontend
    const stats = Object.keys(map).map(date => ({
        date,
        count: map[date]
    }));

    res.json(stats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. Time Travel Route (Get tasks by specific date)
router.get('/date/:userId/:date', async (req, res) => {
    try {
        const { userId, date } = req.params;
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        const tasks = await Task.find({ user: userId, updatedAt: { $gte: start, $lte: end } });
        res.json(tasks);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ✅ 6. MASTER TOGGLE ROUTE (Merged Logic: Streak + Badges + Pet XP + Evolution)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Toggle Status
    task.isCompleted = !task.isCompleted;
    await task.save();

    // 🎁 REWARD SYSTEM (Only if task is marked Completed)
    if (task.isCompleted) {
      const user = await User.findById(task.user);
      
      // --- A. BASIC STATS ---
      user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;
      
      // --- B. STREAK LOGIC (Advanced) ---
      const today = new Date(); 
      today.setHours(0, 0, 0, 0);
      
      let lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      if (lastDate) lastDate.setHours(0, 0, 0, 0);

      // Agar aaj pehli baar task kiya hai (Active Day Update)
      if (!lastDate || today > lastDate) {
        const diffDays = lastDate ? Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24)) : 1;
        
        if (diffDays === 1) {
            user.streak += 1; // Continued Streak
        } else if (diffDays > 1) {
            if (user.isStreakFrozen) {
                user.isStreakFrozen = false; // Unfreeze (Saved by freeze)
                user.streak += 1;
            } else {
                user.streak = 1; // Streak Broken
            }
        } else {
            user.streak = 1; // Fresh Start
        }
        user.lastActiveDate = today;
      }

      // --- C. PET & XP SYSTEM ---
      const xpGain = Math.floor(Math.random() * 10) + 10; // Random 10-20 XP
      user.pet.xp += xpGain;
      
      // Level Up Check
      const xpNeeded = user.pet.level * 100;
      if (user.pet.xp >= xpNeeded) {
        user.pet.level += 1;
        user.pet.xp = user.pet.xp - xpNeeded; // Extra XP carry forward
        user.pet.mood = "excited"; // Pet becomes happy
      }

      // Evolution System (Stages)
      if (user.pet.level >= 20) { user.pet.stage = 4; user.pet.evolutionName = "Inferno Dragon 🐉"; }
      else if (user.pet.level >= 10) { user.pet.stage = 3; user.pet.evolutionName = "Raptor 🦖"; }
      else if (user.pet.level >= 5) { user.pet.stage = 2; user.pet.evolutionName = "Baby Dino 🐣"; }
      else { user.pet.stage = 1; user.pet.evolutionName = "Mystery Egg 🥚"; }

      // --- D. BADGES SYSTEM ---
      const b = user.badges || [];
      if (user.streak >= 7 && !b.includes('Bronze 🥉')) b.push('Bronze 🥉');
      if (user.streak >= 30 && !b.includes('Silver 🥈')) b.push('Silver 🥈');
      if (user.totalTasksCompleted >= 50 && !b.includes('Warrior ⚔️')) b.push('Warrior ⚔️');
      user.badges = b;

      await user.save();
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;