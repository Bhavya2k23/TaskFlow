const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Syllabus = require('../models/Syllabus');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!text) return res.status(400).json({ message: "Content is required" });

    // AI Model Setup
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a smart syllabus parser. Analyze the following course content text.
      Extract the "Subject Name" and a list of "Chapter Titles" or "Topics".
      
      Input Text: "${text}"
      
      Strictly return ONLY a JSON object in this format (no markdown, no extra text):
      {
        "subjectTitle": "Extracted Subject Name",
        "chapters": ["Chapter 1", "Chapter 2", "Chapter 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    // Clean Markdown
    textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedData = JSON.parse(textResponse);

    // Database mein save karo
    const newSyllabus = await Syllabus.create({
      user: userId,
      subjectTitle: parsedData.subjectTitle || "AI Generated Subject",
      chapters: parsedData.chapters.map(title => ({ title, isCompleted: false }))
    });

    res.json(newSyllabus);

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ message: "AI Generation Failed" });
  }
});

module.exports = router;