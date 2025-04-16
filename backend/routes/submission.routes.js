const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/exams/:id/submit', verifyToken, submissionController.submitAnswers);

module.exports = router;
