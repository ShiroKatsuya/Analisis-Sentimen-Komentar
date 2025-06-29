// Hasil Klasifikasi Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page functionality
    initializeResultsTable();
    initializeSearch();
    initializePagination();
    initializeCheckboxes();
    initializeStatistics();
});

function initializeResultsTable() {
    // Add hover effects to table rows
    const tableRows = document.querySelectorAll('.results-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (!e.target.matches('input[type="checkbox"]')) {
                const checkbox = this.querySelector('.row-select');
                checkbox.checked = !checkbox.checked;
                toggleRowSelection(this, checkbox.checked);
                updateBulkActions();
            }
        });
    });
    
    // Initialize filter pills
    initializeFilters();
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase();
        filterTable(searchTerm);
    }, 300));
    
    // Add search keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            filterTable('');
        }
    });
}

function filterTable(searchTerm) {
    const tableRows = document.querySelectorAll('.results-table tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const commentText = row.querySelector('.comment-text').textContent.toLowerCase();
        const prediction = row.querySelector('.prediction-badge').textContent.toLowerCase();
        
        if (commentText.includes(searchTerm) || prediction.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update pagination info and statistics
    updatePaginationInfo(visibleCount);
    updateStatistics();
}

function initializeFilters() {
    // Create filter pills for sentiment types
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-pills';
    filterContainer.innerHTML = `
        <a href="#" class="filter-pill active" data-filter="all">Semua</a>
        <a href="#" class="filter-pill" data-filter="positive">Positif</a>
        <a href="#" class="filter-pill" data-filter="negative">Negatif</a>
    `;
    
    const tableControls = document.querySelector('.table-controls');
    const searchContainer = document.querySelector('.search-container');
    tableControls.insertBefore(filterContainer, searchContainer);
    
    // Add filter functionality
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            const filter = this.getAttribute('data-filter');
            applyFilter(filter);
        });
    });
}

function applyFilter(filter) {
    const tableRows = document.querySelectorAll('.results-table tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const predictionBadge = row.querySelector('.prediction-badge');
        const prediction = predictionBadge.textContent.toLowerCase();
        
        let shouldShow = false;
        
        switch (filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'positive':
                shouldShow = prediction === 'positif';
                break;
            case 'negative':
                shouldShow = prediction === 'negatif';
                break;
        }
        
        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    updatePaginationInfo(visibleCount);
    updateStatistics();
}

function initializePagination() {
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    rowsPerPageSelect.addEventListener('change', function() {
        const rowsPerPage = parseInt(this.value);
        updateTablePagination(rowsPerPage);
    });
    
    prevButton.addEventListener('click', function() {
        navigatePage('prev');
    });
    
    nextButton.addEventListener('click', function() {
        navigatePage('next');
    });
}

function updateTablePagination(rowsPerPage) {
    console.log(`Updating pagination to show ${rowsPerPage} rows per page`);
    showNotification(`Menampilkan ${rowsPerPage} baris per halaman`, 'info');
}

function navigatePage(direction) {
    console.log(`Navigating to ${direction} page`);
    showNotification(`Navigasi halaman: ${direction}`, 'info');
}

function updatePaginationInfo(visibleCount) {
    const paginationInfo = document.querySelector('.pagination-info');
    paginationInfo.textContent = `1-${Math.min(10, visibleCount)} of ${visibleCount}`;
}

function initializeCheckboxes() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-select');
    
    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        const visibleRows = document.querySelectorAll('.results-table tbody tr:not([style*="display: none"])');
        
        visibleRows.forEach(row => {
            const checkbox = row.querySelector('.row-select');
            checkbox.checked = isChecked;
            toggleRowSelection(row, isChecked);
        });
        
        updateBulkActions();
    });
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            toggleRowSelection(row, this.checked);
            updateSelectAllState();
            updateBulkActions();
        });
    });
}

function toggleRowSelection(row, isSelected) {
    if (isSelected) {
        row.classList.add('row-selected');
    } else {
        row.classList.remove('row-selected');
    }
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const visibleRows = document.querySelectorAll('.results-table tbody tr:not([style*="display: none"])');
    const checkedVisibleRows = Array.from(visibleRows).filter(row => 
        row.querySelector('.row-select').checked
    );
    
    if (checkedVisibleRows.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedVisibleRows.length === visibleRows.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
    }
}

function updateBulkActions() {
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (checkedCount > 0) {
        if (!bulkActions) {
            createBulkActionsBar(checkedCount);
        } else {
            updateBulkActionsText(checkedCount);
            bulkActions.classList.add('show');
        }
    } else if (bulkActions) {
        bulkActions.classList.remove('show');
    }
}

function createBulkActionsBar(count) {
    const bulkActions = document.createElement('div');
    bulkActions.className = 'bulk-actions show';
    bulkActions.innerHTML = `
        <div class="bulk-actions-text">
            ${count} hasil dipilih
        </div>
        <button class="btn btn-sm btn-outline-primary" onclick="exportSelected()">
            <i class="fas fa-download me-1"></i>Export CSV
        </button>
        <button class="btn btn-sm btn-outline-success" onclick="analyzeSelected()">
            <i class="fas fa-chart-line me-1"></i>Analisis Detail
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteSelected()">
            <i class="fas fa-trash me-1"></i>Hapus
        </button>
    `;
    
    const tableSection = document.querySelector('.results-table-section');
    const tableContainer = document.querySelector('.table-container');
    tableSection.insertBefore(bulkActions, tableContainer);
}

function updateBulkActionsText(count) {
    const bulkActionsText = document.querySelector('.bulk-actions-text');
    if (bulkActionsText) {
        bulkActionsText.textContent = `${count} hasil dipilih`;
    }
}

function initializeStatistics() {
    // Animate statistics cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
    
    // Add click functionality to stat cards for filtering
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const statLabel = this.querySelector('.stat-label').textContent.toLowerCase();
            
            if (statLabel.includes('positif')) {
                filterBySentiment('positive');
            } else if (statLabel.includes('negatif')) {
                filterBySentiment('negative');
            } else if (statLabel.includes('total')) {
                filterBySentiment('all');
            }
        });
    });
}

function filterBySentiment(sentiment) {
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.classList.remove('active');
        if (pill.getAttribute('data-filter') === sentiment) {
            pill.classList.add('active');
        }
    });
    
    applyFilter(sentiment);
    showNotification(`Filter diterapkan: ${sentiment}`, 'info');
}

function updateStatistics() {
    const visibleRows = document.querySelectorAll('.results-table tbody tr:not([style*="display: none"])');
    let positiveCount = 0;
    let negativeCount = 0;
    
    visibleRows.forEach(row => {
        const prediction = row.querySelector('.prediction-badge').textContent.toLowerCase();
        if (prediction === 'positif') {
            positiveCount++;
        } else if (prediction === 'negatif') {
            negativeCount++;
        }
    });
    
    const totalCount = visibleRows.length;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const label = card.querySelector('.stat-label').textContent.toLowerCase();
        const numberElement = card.querySelector('.stat-number');
        
        if (label.includes('positif')) {
            animateNumber(numberElement, positiveCount);
        } else if (label.includes('negatif')) {
            animateNumber(numberElement, negativeCount);
        } else if (label.includes('total')) {
            animateNumber(numberElement, totalCount);
        }
    });
}

function animateNumber(element, targetNumber) {
    const currentNumber = parseInt(element.textContent);
    const increment = targetNumber > currentNumber ? 1 : -1;
    const duration = 500;
    const steps = Math.abs(targetNumber - currentNumber);
    const stepDuration = duration / Math.max(steps, 1);
    
    let current = currentNumber;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetNumber) {
            clearInterval(timer);
        }
    }, stepDuration);
}

function exportSelected() {
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    showNotification(`Mengexport ${checkedCount} hasil klasifikasi...`, 'info');
    
    // Simulate export process
    setTimeout(() => {
        showNotification('Hasil klasifikasi berhasil diexport ke CSV', 'success');
    }, 1500);
}

function analyzeSelected() {
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    showNotification(`Menganalisis ${checkedCount} hasil klasifikasi...`, 'info');
    
    // Simulate detailed analysis
    setTimeout(() => {
        showModal('Analisis Detail', `
            <div class="analysis-results">
                <h6>Ringkasan Analisis:</h6>
                <ul>
                    <li>Total data dianalisis: ${checkedCount}</li>
                    <li>Akurasi model: 87.5%</li>
                    <li>Confidence score rata-rata: 0.82</li>
                    <li>Kata kunci dominan: efisiensi, anggaran, PHK</li>
                </ul>
            </div>
        `);
    }, 2000);
}

function deleteSelected() {
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${checkedCount} hasil klasifikasi yang dipilih?`)) {
        // Simulate deletion
        document.querySelectorAll('.row-select:checked').forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                row.remove();
            }, 300);
        });
        
        setTimeout(() => {
            updateSelectAllState();
            updateBulkActions();
            updateStatistics();
            showNotification(`${checkedCount} hasil klasifikasi berhasil dihapus`, 'success');
        }, 400);
    }
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
}

// Utility functions
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 1060; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Animation for row removal
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }
`;
document.head.appendChild(style);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + A to select all visible
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.target.matches('input')) {
        e.preventDefault();
        const selectAllCheckbox = document.getElementById('selectAll');
        selectAllCheckbox.checked = true;
        selectAllCheckbox.dispatchEvent(new Event('change'));
    }
    
    // Delete key to delete selected
    if (e.key === 'Delete') {
        const checkedCount = document.querySelectorAll('.row-select:checked').length;
        if (checkedCount > 0) {
            deleteSelected();
        }
    }
    
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const checkedCount = document.querySelectorAll('.row-select:checked').length;
        if (checkedCount > 0) {
            exportSelected();
        }
    }
    
    // Number keys for quick filtering
    if (e.key === '1') {
        filterBySentiment('all');
    } else if (e.key === '2') {
        filterBySentiment('positive');
    } else if (e.key === '3') {
        filterBySentiment('negative');
    }
});