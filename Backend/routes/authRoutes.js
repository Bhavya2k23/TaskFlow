const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');
const Syllabus = require('../models/Syllabus');
const { protect } = require('../middleware/authMiddleware'); // ✅ Import Middleware

// 1. Register (Public)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. Login (Public)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. Get User (Protected)
router.get('/user/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. Update Profile Name (Protected)
router.put('/update/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. Change Password (Protected)
router.put('/password/:id', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. Delete Account (Protected)
router.delete('/delete/:id', protect, async (req, res) => {
  try {
    const userId = req.params.id;
    // Ensure user matches token user
    if (req.user._id.toString() !== userId) return res.status(401).json({ message: "Not authorized" });
    
    await Task.deleteMany({ user: userId });
    await Syllabus.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. Reset Streak (Protected)
router.put('/reset-streak/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.streak = 0;
    user.lastActiveDate = null;
    user.isStreakFrozen = false;
    await user.save();
    res.json({ message: "Streak Reset", streak: 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 8. Toggle Freeze (Protected)
router.put('/toggle-freeze/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isStreakFrozen = !user.isStreakFrozen;
    await user.save();
    res.json({ isStreakFrozen: user.isStreakFrozen });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 9. Update Avatar (Protected)
router.put('/update-avatar/:id', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { avatar }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 10. Remove Avatar (Protected)
router.put('/remove-avatar/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { avatar: "" }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 11. 🏆 GET LEADERBOARD (Public - anyone can see)
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find()
      .select('name avatar streak totalTasksCompleted pet')
      .sort({ streak: -1, totalTasksCompleted: -1 })
      .limit(10);
    res.json(topUsers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 12. 🔄 RESET LEADERBOARD (Protected - Should ideally be Admin only, but strictly protected for now)
router.put('/reset-leaderboard', protect, async (req, res) => {
  try {
    await User.updateMany({}, { 
      streak: 0, 
      totalTasksCompleted: 0,
      'pet.xp': 0, 
      'pet.level': 1,
      'pet.stage': 1,
      'pet.evolutionName': 'Mystery Egg 🥚'
    });
    res.json({ message: "Leaderboard Reset Successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;