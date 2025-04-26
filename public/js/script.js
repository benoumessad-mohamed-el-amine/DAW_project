const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        errorMsg.textContent = 'Logging in...';
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: loginForm.username.value.trim(),
                    password: loginForm.password.value
                })
            });

            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const result = await response.json();

            if (result.success) {
                // Store all user data
                localStorage.setItem('candidateId', result.id);
                localStorage.setItem('userRole', result.role);
                localStorage.setItem('userName', result.name || result.username);
                localStorage.setItem('userEmail', result.email || '');
                localStorage.setItem('userGroup', result.group_name || '');
                localStorage.setItem('userSection', result.section || '');

                // Redirect
                window.location.href = result.role === 'admin'
                    ? "admin.html"
                    : "main.html";
            } else {
                errorMsg.textContent = result.message || 'Login failed';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMsg.textContent = error.message || 'Connection error. Please try again.';
        } finally {
            submitBtn.disabled = false;
        }
    });
} else {
    console.error('Login form not found!');
}