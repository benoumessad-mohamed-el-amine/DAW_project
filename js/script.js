function authenticate() {
    const studentId = document.getElementById("student_id").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");
  
    const validStudentId = "student123";
    const validPassword = "password123";
  
    // Authentication logic
    if (studentId === validStudentId && password === validPassword) {
      window.location.href = "/main_page.html";  
    } else {
      errorMsg.textContent = "Incorrect student Id or password.";
    }
  }
  