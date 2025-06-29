// Arianalyze Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.querySelector('.sentiment-form');
    const submitBtn = document.querySelector('.ok-btn');
    const commentInput = document.querySelector('.comment-input');
    
    // Form submission handling
    if (form) {
        form.addEventListener('submit', function(e) {
            // Add loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Menganalisis...';
            
            // Validate input
            const comment = commentInput.value.trim();
            if (!comment) {
                e.preventDefault();
                showError('Silakan masukkan komentar untuk dianalisis.');
                resetSubmitButton();
                return;
            }
            
            // Add minimum loading time for better UX
            setTimeout(() => {
                // Form will submit naturally
            }, 500);
        });
    }
    
    // Auto-resize textarea
    if (commentInput) {
        commentInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Focus enhancement
        commentInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        commentInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }
    
    // Character limit feedback
    const maxLength = 1000;
    if (commentInput) {
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter text-muted small mt-1';
        commentInput.parentElement.appendChild(charCounter);
        
        function updateCharCounter() {
            const remaining = maxLength - commentInput.value.length;
            charCounter.textContent = `${commentInput.value.length}/${maxLength} karakter`;
            
            if (remaining < 50) {
                charCounter.classList.add('text-warning');
            } else {
                charCounter.classList.remove('text-warning');
            }
            
            if (remaining < 0) {
                charCounter.classList.add('text-danger');
                charCounter.classList.remove('text-warning');
            }
        }
        
        commentInput.addEventListener('input', updateCharCounter);
        updateCharCounter(); // Initialize
    }
    
    // Smooth scroll to results
    const resultsContainer = document.querySelector('.results-container');
    if (resultsContainer) {
        setTimeout(() => {
            resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
    }
    
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
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
        
        const container = document.querySelector('.main-content');
        container.insertBefore(alert, container.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
    
    function resetSubmitButton() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'OK';
    }
    
    // Add some interactive animations
    const illustrationElements = document.querySelectorAll('.character, .phone-mockup');
    illustrationElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add hover effects to illustration
    const phoneScreen = document.querySelector('.phone-screen');
    if (phoneScreen) {
        phoneScreen.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        phoneScreen.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (form && !submitBtn.disabled) {
                form.submit();
            }
        }
        
        // Escape to clear input
        if (e.key === 'Escape' && commentInput) {
            commentInput.value = '';
            commentInput.focus();
        }
    });
    
    // Add subtle loading animation to page elements
    const animateElements = document.querySelectorAll('.main-title, .sentiment-form, .illustration-container');
    animateElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 150);
    });
});

// Additional utility functions for enhanced UX
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Performance optimization - debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
