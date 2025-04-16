// exam.model.js
const exams = [];

module.exports = exams;

const exams = require('../models/exam.model');

// POST /api/exams - Create a new exam
exports.createExam = (req, res) => {
  const { title, questions } = req.body;
  const { role } = req.user; // set by auth middleware

  if (role !== 'teacher') {
    return res.status(403).json({ message: "Only teachers can create exams" });
  }

  const newExam = {
    id: exams.length + 1,
    title,
    questions, // [{ question, options, correct }]
  };

  exams.push(newExam);
  res.status(201).json({ message: "Exam created", exam: newExam });
};

// GET /api/exams - Get all exams
exports.getExams = (req, res) => {
  res.json(exams);
};
exports.submitAnswers = (req, res) => {
    const examId = parseInt(req.params.id);
    const { username } = req.user;
    const { answers } = req.body; // [{ questionIndex: 0, answer: 'A' }]
  
    const exam = exams.find(e => e.id === examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
  
    // Auto-grade the submission
    let score = 0;
  
    answers.forEach(ans => {
      const correct = exam.questions[ans.questionIndex].correct;
      if (ans.answer === correct) score++;
    });
  
    const result = {
      username,
      examId,
      answers,
      score,
      submittedAt: new Date()
    };
  
    submissions.push(result);
  
    res.status(200).json({ message: "Submitted", score });
  };