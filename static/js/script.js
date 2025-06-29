document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.sentiment-form');
    const commentInput = document.getElementById('comment');
    const charCountElement = document.getElementById('charCount');
    const loadingAnimation = document.getElementById('loadingAnimation');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    // Auto-resize textarea and character counting
    if (commentInput) {
        commentInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            updateCharCounter();
        });
        
        // Initialize character counter
        updateCharCounter();
        
        function updateCharCounter() {
            const charCount = commentInput.value.length;
            if (charCountElement) {
                charCountElement.textContent = charCount;
                
                // Change color based on character count
                const counter = charCountElement.parentElement;
                if (charCount > 450) {
                    counter.style.color = '#dc3545'; // Red
                } else if (charCount > 350) {
                    counter.style.color = '#ffc107'; // Yellow
                } else {
                    counter.style.color = '#6c757d'; // Default gray
                }
            }
        }
    }
    
    // Enhanced form submission with loading animation
    if (form) {
        form.addEventListener('submit', function(e) {
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
});

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