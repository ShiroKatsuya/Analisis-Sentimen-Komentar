// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.querySelector('.login-form');
    const submitBtn = document.querySelector('.login-btn');
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
    
    // Form submission handling
    if (form) {
        form.addEventListener('submit', function(e) {
            // Validate inputs
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                showError('Silakan masukkan username dan password.');
                return;
            }
            
            // Add loading state
            form.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';
            
            // Add minimum loading time for better UX
            setTimeout(() => {
                // Form will submit naturally
            }, 800);
        });
    }
    
    // Input focus enhancements
    const inputs = document.querySelectorAll('.login-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Real-time validation feedback
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
            }
        });
    });
    
    // Password visibility toggle (if needed in future)
    function addPasswordToggle() {
        const passwordField = document.querySelector('#password');
        if (passwordField) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'btn btn-outline-secondary password-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            
            // This would require additional styling and positioning
            // Keeping it simple for now as per the design
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key to submit form when inputs are focused
        if (e.key === 'Enter' && (usernameInput.contains(document.activeElement) || passwordInput.contains(document.activeElement))) {
            if (form && !submitBtn.disabled) {
                form.submit();
            }
        }
        
        // Escape to clear current input
        if (e.key === 'Escape') {
            const activeInput = document.activeElement;
            if (activeInput && activeInput.classList.contains('login-input')) {
                activeInput.value = '';
                activeInput.focus();
            }
        }
    });
    
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-1px)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Utility functions
    function showError(message) {
        // Create temporary alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.login-form-wrapper');
        const form = container.querySelector('.login-form');
        container.insertBefore(alert, form);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
    
    function resetForm() {
        form.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
        
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
    }
    
    // Page entrance animation
    const animateElements = document.querySelectorAll('.login-form-wrapper, .login-illustration-container');
    animateElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Interactive illustration effects
    const phoneScreen = document.querySelector('.phone-screen');
    if (phoneScreen) {
        phoneScreen.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        phoneScreen.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Security lock animation on click
    const securityLock = document.querySelector('.security-lock');
    if (securityLock) {
        securityLock.addEventListener('click', function() {
            this.style.animation = 'none';
            this.offsetHeight; // Trigger reflow
            this.style.animation = 'pulse 0.5s ease-in-out';
        });
    }
    
    // Character interaction
    const character = document.querySelector('.login-character');
    if (character) {
        character.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        character.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Auto-focus on username field
    if (usernameInput) {
        setTimeout(() => {
            usernameInput.focus();
        }, 500);
    }
    
    // Form validation styling
    function validateField(field) {
        const value = field.value.trim();
        
        if (value.length === 0) {
            field.classList.remove('is-valid', 'is-invalid');
            return false;
        }
        
        if (field.type === 'password' && value.length < 3) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            return false;
        }
        
        if (field.name === 'username' && value.length < 3) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            return false;
        }
        
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        return true;
    }
    
    // Real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
});