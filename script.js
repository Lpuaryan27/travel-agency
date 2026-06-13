document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const travelPreference = document.getElementById('travelPreference').value;
            
            // Validate terms
            if (!document.getElementById('terms').checked) {
                alert('Please agree to the terms and conditions');
                return;
            }
            
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;

            try {
                // Show loading state
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                submitBtn.disabled = true;
                
                // POST to backend API
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: fullname,
                        email: email,
                        phone: phone,
                        password: password,
                        preference: travelPreference
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Account created successfully! Redirecting to login...');
                    window.location.href = 'sign.html';
                } else {
                    alert(data.message || 'Signup failed. Please check credentials.');
                }
                
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred during signup. Please check your connection to the server.');
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Social login buttons mock
    const googleBtn = document.querySelector('.social-btn.google');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            alert('Google login integration is a premium feature and is currently in demo mode.');
        });
    }
    
    const facebookBtn = document.querySelector('.social-btn.facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            alert('Facebook login integration is a premium feature and is currently in demo mode.');
        });
    }
});