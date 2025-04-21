
//get all users from database
axios.get('http://localhost:3000/auth/users').then((response) => {
  //users contain all the users
  const users=response.data;
  console.log(users)

  //adding it the first user the bottom of the page as an example
  const nameLi = document.getElementById("name");
  nameLi.append(`${users[0].name}`)
  const emailLi = document.getElementById("email");
  emailLi.append(`${users[0].email}`)
  const groupLi = document.getElementById("group");
  groupLi.append(`group : ${users[0].grp}`)
  const sectionLi = document.getElementById("section");
  sectionLi.append(`section : ${users[0].section}`)
})


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
