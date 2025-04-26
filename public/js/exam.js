// Global variables
let examTimer;
const EXAM_DURATION = 300; // 5 minutes in seconds

// Initialize exam when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Verify login status
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) {
        alert('Please login first!');
        window.location.href = 'index.html';
        return;
    }

    // Check if exam already submitted
    checkExamSubmission(candidateId);

    // Start exam timer
    startExamTimer();

    // Setup navigation buttons
    setupQuestionNavigation();
});

// Check if exam was already submitted
async function checkExamSubmission(candidateId) {
    try {
        // Extract module ID from the current page URL
        const moduleId = window.location.pathname.includes('exam2') ? 2 :
            window.location.pathname.includes('exam3') ? 3 : 1;

        const response = await fetch(`http://localhost:3000/candidate/${candidateId}/module/${moduleId}/check`);
        if (!response.ok) throw new Error('Failed to check exam status');

        const data = await response.json();
        if (data.alreadySubmitted) {
            alert('You have already completed this exam.');
            window.location.href = 'main.html';
        }
    } catch (error) {
        console.error('Exam check error:', error);
    }
}

// Start the exam timer
function startExamTimer() {
    const timerElement = document.getElementById('timer');
    let secondsRemaining = EXAM_DURATION;

    examTimer = setInterval(() => {
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (--secondsRemaining < 0) {
            clearInterval(examTimer);
            disableExamInputs();
            handleAutoSubmit();
        }
    }, 1000);
}

// Setup smooth scrolling for question navigation
function setupQuestionNavigation() {
    document.querySelectorAll('.scroll-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId)?.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Disable all exam inputs
function disableExamInputs() {
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.disabled = true;
    });
}

// Handle automatic submission when time expires
function handleAutoSubmit() {
    const moduleId = window.location.pathname.includes('exam2') ? 2 :
        window.location.pathname.includes('exam3') ? 3 : 1;
    submitExam(moduleId);
}

// Main exam submission function (called from HTML button)
async function submitExam(moduleId) {
    // Validate module ID
    if (![1, 2, 3].includes(parseInt(moduleId))) {
        console.error('Invalid module ID:', moduleId);
        return;
    }

    disableExamInputs();
    clearInterval(examTimer);

    const score = calculateExamScore();
    displayScoreToUser(score);

    try {
        await saveExamResults(moduleId, score);
        window.location.href = 'main.html';
    } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit exam. Please try again.');
    }
}

// Calculate the exam score
function calculateExamScore() {
    let score = 0;
    for (let i = 1; i <= 20; i++) {
        const correctAnswer = document.querySelector(`input[name="q${i}"][value="correct"]`);
        const selectedAnswer = document.querySelector(`input[name="q${i}"]:checked`);
        if (selectedAnswer && selectedAnswer === correctAnswer) score++;
    }
    return score;
}

// Display score to user
function displayScoreToUser(score) {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Your score: ${score}/20`;
    scoreElement.style.fontWeight = 'bold';
}

// Save exam results to server
async function saveExamResults(moduleId, score) {
    const candidateId = localStorage.getItem('candidateId');
    if (!candidateId) throw new Error('No candidate ID found');

    const response = await fetch('http://localhost:3000/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            candidateId: candidateId,
            moduleId: moduleId,
            grade: score
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save score');
    }

    return await response.json();
}

// Exit exam handler (called from HTML button)
async function exitExam() {
    const allAnswered = checkAllQuestionsAnswered();
    const moduleId = window.location.pathname.includes('exam2') ? 2 :
        window.location.pathname.includes('exam3') ? 3 : 1;

    if (allAnswered) {
        const confirmSubmit = confirm('You have answered all questions. Submit now?');
        if (confirmSubmit) {
            await submitExam(moduleId);
        }
    } else {
        const confirmExit = confirm('You have unanswered questions. Exit anyway? Your score will be 0.');
        if (confirmExit) {
            try {
                await saveExamResults(moduleId, 0);
                window.location.href = 'main.html';
            } catch (error) {
                console.error('Exit error:', error);
                alert('Failed to save exam status.');
            }
        }
    }
}

// Check if all questions were answered
function checkAllQuestionsAnswered() {
    for (let i = 1; i <= 20; i++) {
        if (!document.querySelector(`input[name="q${i}"]:checked`)) {
            return false;
        }
    }
    return true;
}