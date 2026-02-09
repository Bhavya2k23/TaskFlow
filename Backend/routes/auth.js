const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ✅ For generating tokens
const nodemailer = require('nodemailer'); // ✅ For sending emails
const User = require('../models/User');
const Task = require('../models/Task');
const Syllabus = require('../models/Syllabus');
const { protect } = require('../middleware/authMiddleware');

// 1. Register
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

// 2. Login
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

// ==========================================
// 🔐 FORGOT PASSWORD & RESET (NEW)
// ==========================================

// 3. Forgot Password (Send Email)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and save to DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes Valid
    await user.save();

    // Create Reset URL (Frontend URL)
    // IMPORTANT: Jab deploy karo toh localhost hata kar apna frontend domain daalna
    // Lekin user browser se aa raha hai toh 'req.headers.origin' best hai automatic detection ke liye
    const resetUrl = `${req.headers.origin}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    // Send Email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "TaskFlow - Password Reset",
      html: message
    });

    res.json({ message: "Email Sent Successfully! Check your inbox." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email could not be sent" });
  }
});

// 4. Reset Password (Set New Password)
router.put('/reset-password/:resetToken', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Check if not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or Expired Token" });

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear Reset Fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({ message: "Password Updated Successfully! Please Login." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ... Existing Protected Routes (Keep them as they are) ...
router.get('/user/:id', protect, async (req, res) => {
  try { const user = await User.findById(req.params.id).select('-password'); res.json(user); } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/update/:id', protect, async (req, res) => {
  try { const user = await User.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true }).select('-password'); res.json(user); } catch (err) { res.status(500).json({ message: err.message }); }
});

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

router.delete('/delete/:id', protect, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user._id.toString() !== userId) return res.status(401).json({ message: "Not authorized" });
    await Task.deleteMany({ user: userId });
    await Syllabus.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/reset-streak/:id', protect, async (req, res) => {
  try { const user = await User.findById(req.params.id); user.streak = 0; user.lastActiveDate = null; user.isStreakFrozen = false; await user.save(); res.json({ message: "Streak Reset", streak: 0 }); } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/toggle-freeze/:id', protect, async (req, res) => {
  try { const user = await User.findById(req.params.id); user.isStreakFrozen = !user.isStreakFrozen; await user.save(); res.json({ isStreakFrozen: user.isStreakFrozen }); } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/update-avatar/:id', protect, async (req, res) => {
  try { const { avatar } = req.body; const user = await User.findByIdAndUpdate(req.params.id, { avatar }, { new: true }).select('-password'); res.json(user); } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/remove-avatar/:id', protect, async (req, res) => {
  try { const user = await User.findByIdAndUpdate(req.params.id, { avatar: "" }, { new: true }).select('-password'); res.json(user); } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/leaderboard', async (req, res) => {
  try { const topUsers = await User.find().select('name avatar streak totalTasksCompleted pet').sort({ streak: -1, totalTasksCompleted: -1 }).limit(10); res.json(topUsers); } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/reset-leaderboard', protect, async (req, res) => {
  try { await User.updateMany({}, { streak: 0, totalTasksCompleted: 0, 'pet.xp': 0, 'pet.level': 1, 'pet.stage': 1, 'pet.evolutionName': 'Mystery Egg 🥚' }); res.json({ message: "Leaderboard Reset Successfully!" }); } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin Routes
router.get('/admin/users', protect, async (req, res) => {
  try { const adminUser = await User.findById(req.user.id); if (adminUser.role !== 'admin') return res.status(403).json({ message: "Access Denied" }); const users = await User.find().select('-password').sort({ createdAt: -1 }); res.json(users); } catch (error) { res.status(500).send("Server Error"); }
});

router.delete('/admin/delete-user/:id', protect, async (req, res) => {
  try { const adminUser = await User.findById(req.user.id); if (adminUser.role !== 'admin') return res.status(403).json({ message: "Access Denied" }); await User.findByIdAndDelete(req.params.id); res.json({ message: "User deleted" }); } catch (error) { res.status(500).send("Server Error"); }
});

module.exports = router;