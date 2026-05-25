document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('signInForm');
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const mobileMenuButton = document.getElementById('mobile-menu-button') || document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');

    // Mobile menu toggle
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' 
                ? '<i class="fas fa-eye text-gray-400 hover:text-gray-500"></i>' 
                : '<i class="fas fa-eye-slash text-gray-400 hover:text-gray-500"></i>';
        });
    }

    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (buttonText) buttonText.textContent = 'Signing in...';
            if (buttonSpinner) buttonSpinner.classList.remove('hidden');

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (buttonText) buttonText.textContent = 'Sign In';
                if (buttonSpinner) buttonSpinner.classList.add('hidden');

                if (response.ok) {
                    alert("Login Successful");
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.location.href = "dashboard.html";
                } else {
                    alert(data.message || "Invalid credentials");
                }
            } catch (error) {
                console.error('Login error:', error);
                if (buttonText) buttonText.textContent = 'Sign In';
                if (buttonSpinner) buttonSpinner.classList.add('hidden');
                alert("Server Error connecting to backend");
            }
        });
    }
});
