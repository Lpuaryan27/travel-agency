document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('signInForm');
    const signInSection = document.getElementById('signInSection');
    const otpSection = document.getElementById('otpSection');
    const otpForm = document.getElementById('otpForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    const buttonText = document.getElementById('buttonText');
    const buttonSpinner = document.getElementById('buttonSpinner');
    
    const otpButtonText = document.getElementById('otpButtonText');
    const otpButtonSpinner = document.getElementById('otpButtonSpinner');
    
    const backToSignIn = document.getElementById('backToSignIn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const cooldownText = document.getElementById('cooldownText');
    const cooldownVal = document.getElementById('cooldownVal');
    
    const devOtpBox = document.getElementById('devOtpBox');
    const devOtpCode = document.getElementById('devOtpCode');
    const copyOtpBtn = document.getElementById('copyOtpBtn');
    
    const sentEmail = document.getElementById('sentEmail');
    const sentPhone = document.getElementById('sentPhone');
    const sentPhoneContainer = document.getElementById('sentPhoneContainer');

    let currentEmail = '';
    let currentPhone = '';
    let cooldownTimer = null;
    let secondsLeft = 0;

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

    // Back to sign in click
    if (backToSignIn) {
        backToSignIn.addEventListener('click', () => {
            otpSection.classList.add('hidden');
            signInSection.classList.remove('hidden');
            if (cooldownTimer) clearInterval(cooldownTimer);
            secondsLeft = 0;
            cooldownText.classList.add('hidden');
            resendOtpBtn.classList.remove('hidden');
        });
    }

    // Sign In form submit
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (buttonText) buttonText.textContent = 'Signing in...';
            if (buttonSpinner) buttonSpinner.classList.remove('hidden');

            const emailOrPhone = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: emailOrPhone, password })
                });

                const data = await response.json();

                if (buttonText) buttonText.textContent = 'Sign In';
                if (buttonSpinner) buttonSpinner.classList.add('hidden');

                if (response.ok) {
                    if (data.requireOtp) {
                        // Switch to OTP section
                        currentEmail = data.email;
                        currentPhone = data.phone;
                        
                        sentEmail.textContent = data.email;
                        if (data.phone && data.phone !== 'Not Provided') {
                            sentPhone.textContent = data.phone;
                            sentPhoneContainer.classList.remove('hidden');
                        } else {
                            sentPhoneContainer.classList.add('hidden');
                        }

                        // Developer helper display
                        if (data.demoOtp) {
                            devOtpCode.textContent = data.demoOtp;
                            devOtpBox.classList.remove('hidden');
                        } else {
                            devOtpBox.classList.add('hidden');
                        }

                        // Switch UI
                        signInSection.classList.add('hidden');
                        otpSection.classList.remove('hidden');
                    } else {
                        alert("Login Successful");
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("user", JSON.stringify(data.user));
                        window.location.href = "dashboard.html";
                    }
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

    // OTP form submit
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (otpButtonText) otpButtonText.textContent = 'Verifying...';
            if (otpButtonSpinner) otpButtonSpinner.classList.remove('hidden');

            const otp = document.getElementById('otp').value.trim();

            try {
                const response = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: currentEmail, otp })
                });

                const data = await response.json();

                if (otpButtonText) otpButtonText.textContent = 'Verify & Login';
                if (otpButtonSpinner) otpButtonSpinner.classList.add('hidden');

                if (response.ok) {
                    alert("Login Successful");
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.location.href = "dashboard.html";
                } else {
                    alert(data.message || "Invalid or expired OTP");
                }
            } catch (error) {
                console.error('OTP verify error:', error);
                if (otpButtonText) otpButtonText.textContent = 'Verify & Login';
                if (otpButtonSpinner) otpButtonSpinner.classList.add('hidden');
                alert("Server Error connecting to backend");
            }
        });
    }

    // Resend OTP
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async () => {
            if (secondsLeft > 0) return;

            try {
                const response = await fetch('/api/auth/resend-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: currentEmail })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("A new OTP code has been generated!");
                    if (data.demoOtp) {
                        devOtpCode.textContent = data.demoOtp;
                        devOtpBox.classList.remove('hidden');
                    }
                    
                    // Start 60s cooldown
                    secondsLeft = 60;
                    resendOtpBtn.classList.add('hidden');
                    cooldownText.classList.remove('hidden');
                    cooldownVal.textContent = secondsLeft;
                    
                    if (cooldownTimer) clearInterval(cooldownTimer);
                    cooldownTimer = setInterval(() => {
                        secondsLeft--;
                        cooldownVal.textContent = secondsLeft;
                        if (secondsLeft <= 0) {
                            clearInterval(cooldownTimer);
                            cooldownText.classList.add('hidden');
                            resendOtpBtn.classList.remove('hidden');
                        }
                    }, 1000);
                } else {
                    alert(data.message || "Failed to resend OTP");
                }
            } catch (error) {
                console.error('OTP resend error:', error);
                alert("Server Error resending OTP");
            }
        });
    }

    // Copy OTP button click
    if (copyOtpBtn && devOtpCode) {
        copyOtpBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(devOtpCode.textContent);
            alert('OTP Code copied to clipboard!');
        });
    }
});
