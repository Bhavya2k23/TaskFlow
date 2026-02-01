const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const syllabusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectTitle: { type: String, required: true },
  chapters: [chapterSchema] // Har subject ke andar chapters ki list hogi
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);