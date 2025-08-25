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
    // Input mode selector logic
    const inputModeSelector = document.getElementById('inputModeSelector');
    const chooseSingle = document.getElementById('chooseSingle');
    const chooseBulk = document.getElementById('chooseBulk');
    const singleForm = document.getElementById('sentimentForm');
    const bulkSection = document.getElementById('bulkSection');

    function showSection(section) {
        // Hide both first
        if (singleForm) singleForm.classList.add('d-none');
        if (bulkSection) bulkSection.classList.add('d-none');

        // Show requested
        if (section === 'single' && singleForm) {
            singleForm.classList.remove('d-none');
            singleForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (commentInput) commentInput.focus();
        }
        if (section === 'bulk' && bulkSection) {
            bulkSection.classList.remove('d-none');
            bulkSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    if (chooseSingle) {
        chooseSingle.addEventListener('click', () => showSection('single'));
    }
    if (chooseBulk) {
        chooseBulk.addEventListener('click', () => showSection('bulk'));
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
        positiveBar.style.width = positivePercent + '%';
        negativeBar.style.width = negativePercent + '%';
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

// Bulk Classification Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeBulkClassification();
});

function initializeBulkClassification() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const csvFileInput = document.getElementById('csvFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');
    const commentColumnSelect = document.getElementById('commentColumn');
    const bulkForm = document.getElementById('bulkForm');
    const bulkAnalyzeBtn = document.getElementById('bulkAnalyzeBtn');
    
    if (!fileUploadArea || !csvFileInput) return;
    
    // File upload handling
    csvFileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop functionality
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleDrop);
    
    // Remove file button
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', removeFile);
    }
    
    // Form submission
    if (bulkForm) {
        bulkForm.addEventListener('submit', handleBulkSubmit);
        // Ensure form starts in clean state
        bulkForm.reset();
    }
    
    // Add backup click event listener to button
    if (bulkAnalyzeBtn) {
        bulkAnalyzeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleBulkSubmit(e);
        });
        
        // Ensure button starts in correct state
        bulkAnalyzeBtn.disabled = false;
        bulkAnalyzeBtn.style.pointerEvents = 'auto';
        bulkAnalyzeBtn.style.cursor = 'pointer';
    }
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            displayFileInfo(file);
            parseCSVHeaders(file);
        }
    }
    
    function handleDragOver(event) {
        event.preventDefault();
        fileUploadArea.classList.add('dragover');
    }
    
    function handleDragLeave(event) {
        event.preventDefault();
        fileUploadArea.classList.remove('dragover');
    }
    
    function handleDrop(event) {
        event.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv') {
                csvFileInput.files = files;
                displayFileInfo(file);
                parseCSVHeaders(file);
            } else {
                showNotification('Hanya file CSV yang diperbolehkan', 'error');
            }
        }
    }
    
    function displayFileInfo(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        fileUploadArea.style.display = 'none';
    }
    
    function removeFile() {
        csvFileInput.value = '';
        fileInfo.style.display = 'none';
        fileUploadArea.style.display = 'block';
        commentColumnSelect.innerHTML = '<option value="">Pilih kolom...</option>';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function parseCSVHeaders(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                // Populate column selector
                commentColumnSelect.innerHTML = '<option value="">Pilih kolom...</option>';
                headers.forEach((header, index) => {
                    if (header) {
                        const option = document.createElement('option');
                        option.value = index;
                        option.textContent = header;
                        commentColumnSelect.appendChild(option);
                    }
                });
                
                // Auto-select first column if it looks like a comment column
                const commentKeywords = ['komentar', 'comment', 'text', 'teks', 'isi', 'content', 'pesan'];
                const autoSelectIndex = headers.findIndex(header => 
                    commentKeywords.some(keyword => 
                        header.toLowerCase().includes(keyword)
                    )
                );
                
                if (autoSelectIndex !== -1) {
                    commentColumnSelect.value = autoSelectIndex;
                }
                
            } catch (error) {
                console.error('Error parsing CSV:', error);
                showNotification('Error parsing file CSV', 'error');
            }
        };
        reader.readAsText(file);
    }
    
}

// Global flag to track if form is currently processing
let isBulkFormProcessing = false;

// Global function for handling bulk form submission
function handleBulkSubmit(event) {
    event.preventDefault();
    
    console.log('Bulk form submission triggered'); // Debug log
    
    // Prevent multiple submissions
    if (isBulkFormProcessing) {
        console.log('Form is already processing, ignoring submission');
        return;
    }
    
    const bulkForm = document.getElementById('bulkForm');
    const csvFileInput = document.getElementById('csvFile');
    const commentColumnSelect = document.getElementById('commentColumn');
    const bulkAnalyzeBtn = document.getElementById('bulkAnalyzeBtn');
    
    const formData = new FormData(bulkForm);
    const file = csvFileInput.files[0];
    const commentColumn = commentColumnSelect.value;
    
    if (!file) {
        showNotification('Pilih file CSV terlebih dahulu', 'error');
        return;
    }
    
    if (!commentColumn) {
        showNotification('Pilih kolom komentar terlebih dahulu', 'error');
        return;
    }
    
    // Check if button is already disabled
    if (bulkAnalyzeBtn.disabled) {
        console.log('Button is disabled, re-enabling...'); // Debug log
        bulkAnalyzeBtn.disabled = false;
    }
    
    // Show progress container
    showProgressContainer();
    
    // Set processing flag
    isBulkFormProcessing = true;
    
    // Disable form
    bulkAnalyzeBtn.disabled = true;
    bulkAnalyzeBtn.classList.add('loading');
    
    // Start bulk analysis
    startBulkAnalysis(formData);
}

function showProgressContainer() {
    const progressContainer = document.getElementById('bulkProgressContainer');
    if (progressContainer) {
        progressContainer.style.display = 'block';
        progressContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function startBulkAnalysis(formData) {
    // Make actual API call to backend
    const progressBar = document.getElementById('bulkProgressBar');
    const processedCount = document.getElementById('processedCount');
    const remainingCount = document.getElementById('remainingCount');
    const currentBatch = document.getElementById('currentBatch');
    const totalBatches = document.getElementById('totalBatches');
    
    // Show initial progress
    if (progressBar) progressBar.style.width = '0%';
    if (processedCount) processedCount.textContent = '0';
    if (remainingCount) remainingCount.textContent = 'Processing...';
    if (currentBatch) currentBatch.textContent = '1';
    if (totalBatches) totalBatches.textContent = '1';
    
    // Make AJAX call to backend
    fetch('/bulk_analyze', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update progress to 100%
            if (progressBar) progressBar.style.width = '100%';
            if (processedCount) processedCount.textContent = data.summary.total;
            if (remainingCount) remainingCount.textContent = '0';
            
            // Show success message
            showNotification(data.message, 'success');
            
            // Show results
            setTimeout(() => {
                showBulkResults(data.results, data.summary);
                hideProgressContainer();
                resetBulkForm();
            }, 1000);
        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error in bulk analysis:', error);
        showNotification(error.message || 'Terjadi kesalahan saat analisis bulk', 'error');
        hideProgressContainer();
        resetBulkForm();
    });
}

function showBulkResults(results, summary) {
    const resultsContainer = document.getElementById('bulkResultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Populate sample results
        populateSampleResults(results);
        
        // Add a small delay to ensure DOM elements are fully rendered
        setTimeout(() => {
            updateSummaryCards(summary);
        }, 100);
    }
}

function hideProgressContainer() {
    const progressContainer = document.getElementById('bulkProgressContainer');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

function resetBulkForm() {
    // Reset processing flag
    isBulkFormProcessing = false;
    
    const bulkAnalyzeBtn = document.getElementById('bulkAnalyzeBtn');
    const bulkForm = document.getElementById('bulkForm');
    const csvFileInput = document.getElementById('csvFile');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const commentColumnSelect = document.getElementById('commentColumn');
    
    // Reset button state
    if (bulkAnalyzeBtn) {
        bulkAnalyzeBtn.disabled = false;
        bulkAnalyzeBtn.classList.remove('loading');
        
        // Reset button text
        const btnText = bulkAnalyzeBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.innerHTML = '<i class="fas fa-play me-2"></i>Mulai Analisis Bulk';
        }
        
        // Hide loading spinner
        const loadingSpinner = bulkAnalyzeBtn.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
    
    // Reset form state
    if (bulkForm) {
        // Reset form to initial state
        bulkForm.reset();
        
        // Ensure form submission is working by re-adding event listener
        // Use a more robust approach to prevent any issues
        bulkForm.removeEventListener('submit', handleBulkSubmit);
        bulkForm.addEventListener('submit', handleBulkSubmit);
        
        // Also add a click event listener to the button as a backup
        if (bulkAnalyzeBtn) {
            bulkAnalyzeBtn.removeEventListener('click', handleBulkSubmit);
            bulkAnalyzeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleBulkSubmit(e);
            });
        }
    }
    
    // Reset file input and display
    if (csvFileInput) {
        csvFileInput.value = '';
        // Trigger change event to reset any internal state
        csvFileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (fileUploadArea) {
        fileUploadArea.style.display = 'block';
    }
    
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
    
    // Reset column selector
    if (commentColumnSelect) {
        commentColumnSelect.innerHTML = '<option value="">Pilih kolom...</option>';
    }
    
    // Force a small delay to ensure DOM updates are complete
    setTimeout(() => {
        // Double-check that the form is properly reset
        if (bulkForm && bulkAnalyzeBtn) {
            bulkAnalyzeBtn.disabled = false;
            bulkForm.reset();
            
            // Ensure the button is clickable by removing any pointer-events restrictions
            bulkAnalyzeBtn.style.pointerEvents = 'auto';
            bulkAnalyzeBtn.style.cursor = 'pointer';
            
            console.log('Form reset completed, button should be clickable'); // Debug log
        }
    }, 100);
}

function populateSampleResults(results) {
    const tbody = document.getElementById('bulkResultsBody');
    if (!tbody) return;
    
    // Use real results from API if available, otherwise show sample data
    const dataToShow = results && results.length > 0 ? results : [
        { comment: 'Produk sangat bagus dan berkualitas tinggi', sentiment: 'Positif', confidence: '0.95', status: 'Berhasil' },
        { comment: 'Pelayanan kurang memuaskan', sentiment: 'Negatif', confidence: '0.87', status: 'Berhasil' },
        { comment: 'Harga sesuai dengan kualitas', sentiment: 'Positif', confidence: '0.78', status: 'Berhasil' },
        { comment: 'Pengiriman lambat', sentiment: 'Negatif', confidence: '0.82', status: 'Berhasil' },
        { comment: 'Produk biasa saja', sentiment: 'Positif', confidence: '0.65', status: 'Berhasil' }
    ];
    
    tbody.innerHTML = '';
    dataToShow.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.comment}</td>
            <td>
                <span class="badge ${getSentimentBadgeClass(item.sentiment)}">
                    ${item.sentiment}
                </span>
            </td>
      
        `;
        tbody.appendChild(row);
    });
}

{/* <td>${(parseFloat(item.confidence) * 100).toFixed(1)}%</td>
<td>
    <span class="badge bg-success">${item.status}</span>
</td> */}
function getSentimentBadgeClass(sentiment) {
    switch (sentiment) {
        case 'Positif': return 'bg-success';
        case 'Negatif': return 'bg-danger';
        default: return 'bg-secondary';
        
    }
}

function updateSummaryCards(summary) {
    // Update summary counts - in real implementation these would come from actual results
    const positiveCountElement = document.getElementById('positiveCount');
    const negativeCountElement = document.getElementById('negativeCount');
    const totalCountElement = document.getElementById('totalCount');
    
    if (positiveCountElement) {
        positiveCountElement.textContent = summary.positive || '0';
    }
    
    if (negativeCountElement) {
        negativeCountElement.textContent = summary.negative || '0';
    }
    
    if (totalCountElement) {
        totalCountElement.textContent = summary.total || '0';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export functionality
document.addEventListener('DOMContentLoaded', function() {
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
});

function exportToCSV() {
    showNotification('Fitur export CSV akan segera tersedia', 'info');
}

function exportToExcel() {
    showNotification('Fitur export Excel akan segera tersedia', 'info');
}