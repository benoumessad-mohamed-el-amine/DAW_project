/* const examRoutes = require('./routes/exam.routes');
app.use('/api/exams', examRoutes);

const submissionRoutes = require('./routes/submission.routes');
app.use('/api', submissionRoutes); */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "examWebsite"
})
connection.connect()

app = express();
app.use(cors());

/* app.get('/auth/users', (req, res) => {
    connection.query('SELECT * FROM students', (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving users');
        } else {
            res.json(result);
        }
    })
}); */
app.get('/auth/users',(req,res)=>{
    connection.query(`SELECT * FROM students WHERE _id=${req.id}`,(err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving users');
        } else {
            res.json(result);
        }

})
})
app.post('/auth/signin', (req, res) => {
    console.log(req.body);
});







app.listen(3000, () => {
    console.log('Server is running on port 3000');
});