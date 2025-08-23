document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.sentiment-form');
    const commentFields = document.getElementById('commentFields');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const loadingAnimation = document.getElementById('loadingAnimation');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const totalCommentsElement = document.getElementById('totalComments');
    
    let commentCounter = 1;
    
    // Initialize character counters for existing comment fields
    initializeCommentFields();
    
    // Add new comment field
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', addNewCommentField);
    }
    
    // Enhanced form submission with loading animation
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading animation
            if (loadingAnimation) {
                loadingAnimation.style.display = 'block';
            }
            
            // Add loading state to button
            if (analyzeBtn) {
                analyzeBtn.classList.add('loading');
                analyzeBtn.disabled = true;
            }
            
            // Hide results if showing
            const resultsContainer = document.querySelector('.results-container');
            if (resultsContainer) {
                resultsContainer.style.opacity = '0.5';
            }
            
            // Submit form
            form.submit();
        });
    }
    
    // Initialize trend chart if results are present
    initializeTrendChart();
    
    // Auto-hide loading on page load if results are shown
    if (document.querySelector('.results-container')) {
        setTimeout(() => {
            if (loadingAnimation) {
                loadingAnimation.style.display = 'none';
            }
            if (analyzeBtn) {
                analyzeBtn.classList.remove('loading');
                analyzeBtn.disabled = false;
            }
        }, 100);
    }
    
    function initializeCommentFields() {
        const textareas = document.querySelectorAll('.comment-input');
        textareas.forEach(textarea => {
            setupTextarea(textarea);
        });
        updateTotalComments();
    }
    
    function setupTextarea(textarea) {
        // Auto-resize textarea
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            updateCharCounter(this);
        });
        
        // Initialize character counter
        updateCharCounter(textarea);
        
        // Initialize height
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    function addNewCommentField() {
        commentCounter++;
        const newCommentField = createCommentField(commentCounter);
        commentFields.appendChild(newCommentField);
        
        // Setup the new textarea
        const newTextarea = newCommentField.querySelector('.comment-input');
        setupTextarea(newTextarea);
        
        // Show remove button for all fields except the first one
        updateRemoveButtons();
        
        // Update total count
        updateTotalComments();
        
        // Smooth scroll to new field
        newCommentField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus on new textarea
        setTimeout(() => {
            newTextarea.focus();
        }, 100);
    }
    
    function createCommentField(id) {
        const commentField = document.createElement('div');
        commentField.className = 'comment-field mb-3';
        commentField.setAttribute('data-comment-id', id);
        
        commentField.innerHTML = `
            <div class="comment-input-wrapper">
                <div class="comment-header d-flex justify-content-between align-items-center mb-2">
                    <span class="comment-number">Komentar #${id}</span>
                    <button type="button" class="btn btn-outline-danger btn-sm remove-comment-btn" 
                            onclick="removeComment(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <textarea 
                    class="form-control comment-input" 
                    name="comments[]" 
                    rows="3" 
                    placeholder="Ketik komentar Anda di sini..."
                    required></textarea>
                <div class="comment-footer d-flex justify-content-between align-items-center mt-2">
                    <div class="char-counter">
                        <span class="char-count">0</span> karakter
                    </div>
                    <div class="comment-actions">
                        <button type="button" class="btn btn-outline-secondary btn-sm copy-btn" 
                                onclick="copyComment(this)">
                            <i class="fas fa-copy me-1"></i>Copy
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return commentField;
    }
    
    function updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-comment-btn');
        removeButtons.forEach((button, index) => {
            if (index === 0) {
                button.style.display = 'none'; // Hide for first comment
            } else {
                button.style.display = 'flex'; // Show for others
            }
        });
    }
    
    function updateTotalComments() {
        const totalComments = document.querySelectorAll('.comment-field').length;
        if (totalCommentsElement) {
            totalCommentsElement.textContent = totalComments;
        }
    }
    
    function validateForm() {
        const textareas = document.querySelectorAll('.comment-input');
        let isValid = true;
        
        textareas.forEach((textarea, index) => {
            if (!textarea.value.trim()) {
                isValid = false;
                textarea.classList.add('is-invalid');
                
                // Add error message if not exists
                if (!textarea.nextElementSibling || !textarea.nextElementSibling.classList.contains('invalid-feedback')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = 'Komentar tidak boleh kosong';
                    textarea.parentNode.appendChild(errorDiv);
                }
            } else {
                textarea.classList.remove('is-invalid');
                const errorDiv = textarea.parentNode.querySelector('.invalid-feedback');
                if (errorDiv) {
                    errorDiv.remove();
                }
            }
        });
        
        if (!isValid) {
            // Show error message
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
            errorAlert.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Mohon isi semua komentar sebelum menganalisis
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Remove existing error alerts
            const existingAlerts = form.querySelectorAll('.alert-danger');
            existingAlerts.forEach(alert => alert.remove());
            
            form.appendChild(errorAlert);
            
            // Scroll to first error
            const firstError = form.querySelector('.is-invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return isValid;
    }
});

// Global functions for onclick handlers

// Global function to update character counter
function updateCharCounter(textarea) {
    const commentField = textarea.closest('.comment-field');
    const charCountElement = commentField.querySelector('.char-count');
    const charCount = textarea.value.length;
    
    if (charCountElement) {
        charCountElement.textContent = charCount;
        
        // Change color based on character count
        if (charCount > 450) {
            charCountElement.style.color = '#dc3545'; // Red
        } else if (charCount > 350) {
            charCountElement.style.color = '#ffc107'; // Yellow
        } else {
            charCountElement.style.color = '#495057'; // Default
        }
    }
}

function removeComment(button) {
    const commentField = button.closest('.comment-field');
    const commentId = parseInt(commentField.getAttribute('data-comment-id'));
    
    // Add removal animation
    commentField.style.transform = 'scale(0.8)';
    commentField.style.opacity = '0';
    
    setTimeout(() => {
        commentField.remove();
        
        // Renumber remaining comments
        const remainingFields = document.querySelectorAll('.comment-field');
        remainingFields.forEach((field, index) => {
            const newId = index + 1;
            field.setAttribute('data-comment-id', newId);
            const numberSpan = field.querySelector('.comment-number');
            if (numberSpan) {
                numberSpan.textContent = `Komentar #${newId}`;
            }
        });
        
        // Update remove buttons visibility
        const removeButtons = document.querySelectorAll('.remove-comment-btn');
        removeButtons.forEach((btn, index) => {
            if (index === 0) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
            }
        });
        
        // Update total count
        const totalCommentsElement = document.getElementById('totalComments');
        if (totalCommentsElement) {
            totalCommentsElement.textContent = remainingFields.length;
        }
        
        // Update comment counter
        if (window.commentCounter) {
            window.commentCounter = remainingFields.length;
        }
    }, 300);
}

function copyComment(button) {
    const commentField = button.closest('.comment-field');
    const textarea = commentField.querySelector('.comment-input');
    const text = textarea.value;
    
    if (text.trim()) {
        navigator.clipboard.writeText(text).then(() => {
            // Show success feedback
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-secondary');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            textarea.select();
            document.execCommand('copy');
        });
    }
}

function resetForm() {
    // Clear all comment fields except the first one
    const commentFields = document.querySelectorAll('.comment-field');
    commentFields.forEach((field, index) => {
        if (index === 0) {
            // Keep first field but clear content
            const textarea = field.querySelector('.comment-input');
            if (textarea) {
                textarea.value = '';
                textarea.style.height = 'auto';
                updateCharCounter(textarea);
            }
        } else {
            // Remove additional fields
            field.remove();
        }
    });
    
    // Reset comment counter
    if (window.commentCounter) {
        window.commentCounter = 1;
    }
    
    // Update total count
    const totalCommentsElement = document.getElementById('totalComments');
    if (totalCommentsElement) {
        totalCommentsElement.textContent = '1';
    }
    
    // Hide results
    const resultsContainer = document.querySelector('.results-container');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    
    // Reset remove buttons visibility
    updateRemoveButtons();
    
    // Scroll smoothly to the top of the comment input form
    const commentForm = document.querySelector('.sentiment-form');
    if (commentForm) {
        commentForm.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
    }
    
    // Focus on first textarea after scrolling
    setTimeout(() => {
        const firstTextarea = document.querySelector('.comment-input');
        if (firstTextarea) {
            firstTextarea.focus();
        }
    }, 500); // Wait for scroll to complete
}

// Helper function to update remove buttons visibility
function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-comment-btn');
    removeButtons.forEach((button, index) => {
        if (index === 0) {
            button.style.display = 'none';
        } else {
            button.style.display = 'flex';
        }
    });
}

function initializeTrendChart() {
    const trendBars = document.querySelectorAll('.trend-bar');
    if (trendBars.length === 0) return;
    
    // Use current page result for trend visualization
    const currentResult = document.querySelector('.sentiment-result');
    if (currentResult) {
        const isPositive = currentResult.classList.contains('sentiment-positive');
        const fallbackData = {
            positive: isPositive ? 75 : 25,
            negative: isPositive ? 25 : 75
        };
        updateTrendBars(fallbackData);
    } else {
        // Default balanced view
        updateTrendBars({ positive: 50, negative: 50 });
    }
}

function updateTrendBars(data) {
    const positiveBar = document.querySelector('.trend-bar.positive .bar-fill');
    const negativeBar = document.querySelector('.trend-bar.negative .bar-fill');
    
    if (positiveBar && negativeBar) {
        // Calculate percentages
        const total = data.positive + data.negative;
        const positivePercent = total > 0 ? (data.positive / total) * 100 : 50;
        const negativePercent = total > 0 ? (data.negative / total) * 100 : 50;
        
        // Animate bars
        setTimeout(() => {
            positiveBar.style.height = `${Math.max(positivePercent * 0.6, 10)}px`;
            negativeBar.style.height = `${Math.max(negativePercent * 0.6, 10)}px`;
        }, 500);
    }
}

function quickCopy(text, type) {
    navigator.clipboard.writeText(text).then(() => {
        // Find the button that was clicked
        const buttons = document.querySelectorAll('.result-actions button');
        buttons.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(type)) {
                // Visual feedback
                const originalHTML = btn.innerHTML;
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = originalHTML;
                }, 2000);
            }
        });
        
        // Show toast notification
        showCopyNotification(type === 'comment' ? 'Komentar' : 'Hasil', 'berhasil disalin!');
    }).catch(() => {
        showCopyNotification('Error', 'Gagal menyalin teks');
    });
}

function showCopyNotification(title, message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle text-success me-2"></i>
            <strong>${title}</strong> ${message}
        </div>
    `;
    
    // Add toast styles if not exists
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1050;
                animation: slideInRight 0.3s ease-out;
            }
            .toast-content {
                display: flex;
                align-items: center;
                font-size: 0.875rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyNotification('Teks', 'berhasil disalin!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyNotification('Teks', 'berhasil disalin!');
        } catch (err) {
            showCopyNotification('Error', 'Gagal menyalin teks');
        }
        document.body.removeChild(textArea);
    });
}

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

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('.sentiment-form');
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
    }
}

function resetSubmitButton() {
    const submitBtn = document.querySelector('.sentiment-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">OK</span>';
        submitBtn.classList.remove('loading');
    }
}