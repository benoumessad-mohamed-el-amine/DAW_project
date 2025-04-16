const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const verifyToken = require('../middleware/auth.middleware'); // next step!

router.post('/', verifyToken, examController.createExam);
router.get('/', verifyToken, examController.getExams);

module.exports = router;
