const express = require('express');
const router = express.Router();
const Syllabus = require('../models/Syllabus');

// Get All
router.get('/:userId', async (req, res) => {
  try { const subjects = await Syllabus.find({ user: req.params.userId }); res.json(subjects); } 
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Create Subject
router.post('/', async (req, res) => {
  try {
    const { userId, subjectTitle } = req.body;
    const newSubject = await Syllabus.create({ user: userId, subjectTitle, chapters: [] });
    res.status(201).json(newSubject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ✅ ADD CHAPTER (Important Fix)
router.post('/chapter/:subjectId', async (req, res) => {
  try {
    const { title } = req.body;
    const subject = await Syllabus.findById(req.params.subjectId);
    subject.chapters.push({ title, isCompleted: false });
    await subject.save();
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle Chapter
router.put('/chapter/:subjectId/:chapterId', async (req, res) => {
  try {
    const subject = await Syllabus.findById(req.params.subjectId);
    const chapter = subject.chapters.id(req.params.chapterId);
    chapter.isCompleted = !chapter.isCompleted;
    await subject.save();
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete Chapter
router.delete('/chapter/:subjectId/:chapterId', async (req, res) => {
  try {
    const subject = await Syllabus.findById(req.params.subjectId);
    subject.chapters.pull({ _id: req.params.chapterId });
    await subject.save();
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete Subject
router.delete('/:subjectId', async (req, res) => {
  try { await Syllabus.findByIdAndDelete(req.params.subjectId); res.json({ message: "Deleted" }); } 
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Reorder
router.put('/reorder/:subjectId', async (req, res) => {
  try {
    const { chapters } = req.body;
    const subject = await Syllabus.findById(req.params.subjectId);
    subject.chapters = chapters;
    await subject.save();
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;