const examRoutes = require('./routes/exam.routes');
app.use('/api/exams', examRoutes);

const submissionRoutes = require('./routes/submission.routes');
app.use('/api', submissionRoutes);
