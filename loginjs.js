const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

document.addEventListener('DOMContentLoaded', function() {
    // Auto-fill valid credentials
    const signInForm = document.querySelector('.form-container.sign-in form');
    if (signInForm) {
        const emailInput = signInForm.querySelector('input[type="email"]');
        const passwordInput = signInForm.querySelector('input[type="password"]');
        if (emailInput) emailInput.value = 'user@example.com';
        if (passwordInput) passwordInput.value = '123';
    }

    const loginButton = document.getElementById('form-login');
    const errorDiv = document.getElementById('login-error');

    if (loginButton && signInForm) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            const emailInput = signInForm.querySelector('input[type="email"]');
            const passwordInput = signInForm.querySelector('input[type="password"]');
            
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            
            const validEmail = 'user@example.com';
            const validPassword = '123';
            
            // Hide error first
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
            
            if (email === validEmail && password === validPassword) {
                window.location.href = 'mainattendance.html';
            } else {
                if (errorDiv) {
                    errorDiv.textContent = 'Invalid';
                    errorDiv.style.display = 'block';
                }
            }
        });
    }
});
