// Hasil Klasifikasi Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page functionality
    initializeResultsTable();
    initializeSearch();
    initializePagination();
    initializeCheckboxes();
    initializeStatistics();
    initializeDeleteButtons();
    initializeExportCsv();
});

function initializeResultsTable() {
    // Add hover effects to table rows
    const tableRows = document.querySelectorAll('.results-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            // Prevent checkbox and delete button clicks from toggling row selection
            if (e.target.closest('.row-select') || e.target.closest('.delete-btn')) {
                return;
            }
            const checkbox = this.querySelector('.row-select');
            if (checkbox) {
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
    const searchBox = searchInput.closest('.search-box');
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.className = 'clear-search-btn';
    clearSearchBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
    searchBox.appendChild(clearSearchBtn);

    // Show/hide clear button based on input value
    searchInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        filterTable(this.value.toLowerCase());
    });

    // Clear search input when clear button is clicked
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        this.style.display = 'none';
        filterTable('');
        searchInput.focus();
    });
    
    // Add search keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            clearSearchBtn.style.display = 'none';
            filterTable('');
        }
    });
}

function filterTable(searchTerm) {
    const tableRows = document.querySelectorAll('.results-table tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const commentElement = row.querySelector('.comment-text');
        const predictionElement = row.querySelector('.prediction-badge');
        
        if (commentElement && predictionElement) {
            const commentText = commentElement.textContent.toLowerCase();
            const prediction = predictionElement.textContent.toLowerCase();
            
            if (commentText.includes(searchTerm) || prediction.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    // Update pagination info and statistics
    updatePaginationInfo(visibleCount);
    updateStatistics();
    updateSelectAllState(); // Update select all checkbox state after filtering
    updateBulkActions(); // Update bulk actions visibility
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
        
        if (predictionBadge) {
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
        }
    });
    
    updatePaginationInfo(visibleCount);
    updateStatistics();
    updateSelectAllState(); // Update select all checkbox state after filtering
    updateBulkActions(); // Update bulk actions visibility
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
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');

    if (deleteSelectedBtn) {
        if (checkedCount > 0) {
            deleteSelectedBtn.style.display = 'inline-block'; // Show button
        } else {
            deleteSelectedBtn.style.display = 'none'; // Hide button
        }
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
    const currentNumber = 0; // Always start animation from 0
    const increment = 1; // Always increment
    const duration = 500;
    const steps = Math.abs(targetNumber - currentNumber);
    const stepDuration = duration / Math.max(steps, 1);
    
    let current = currentNumber;
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetNumber) || (increment < 0 && current <= targetNumber)) {
            current = targetNumber; // Ensure it stops exactly at target
            clearInterval(timer);
        }
        element.textContent = current;
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
    const selectedCommentIds = Array.from(document.querySelectorAll('.row-select:checked'))
                                .map(checkbox => checkbox.closest('tr').dataset.commentId);

    if (selectedCommentIds.length === 0) {
        showNotification('Pilih setidaknya satu hasil untuk dihapus.', 'warning');
        return;
    }

    if (confirm(`Anda yakin ingin menghapus ${selectedCommentIds.length} hasil terpilih?`)) {
        let deletedCount = 0;
        let failedCount = 0;

        const deletePromises = selectedCommentIds.map(id => deleteComment(id));

        Promise.allSettled(deletePromises)
            .then(results => {
                results.forEach(result => {
                    if (result.status === 'fulfilled' && result.value) {
                        deletedCount++;
                    } else {
                        failedCount++;
                    }
                });

                if (deletedCount > 0) {
                    showNotification(`${deletedCount} hasil berhasil dihapus.`, 'success');
                }
                if (failedCount > 0) {
                    showNotification(`${failedCount} hasil gagal dihapus.`, 'error');
                }
                location.reload(); // Refresh the page to reflect changes
            })
            .catch(error => {
                showNotification(`Terjadi kesalahan saat memproses penghapusan massal: ${error.message}`, 'error');
            });
    }
}

function initializeDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.dataset.id;
            if (confirm('Anda yakin ingin menghapus hasil klasifikasi ini?')) {
                deleteComment(commentId);
            }
        });
    });

    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelected);
    }
}

async function deleteComment(commentId) {
    try {
        const response = await fetch(`/delete-comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (response.ok) {
            showNotification(data.message, 'success');
            const rowToRemove = document.querySelector(`tr[data-comment-id="${commentId}"]`);
            if (rowToRemove) {
                rowToRemove.remove();
                // Re-calculate and update statistics and pagination after deletion
                updatePaginationInfo(document.querySelectorAll('.results-table tbody tr:not([style*="display: none"])').length);
                updateStatistics();
                updateSelectAllState();
                updateBulkActions();
            }
            return true; // Indicate success
        } else {
            showNotification(data.message || 'Gagal menghapus hasil klasifikasi.', 'error');
            return false; // Indicate failure
        }
    } catch (error) {
        showNotification(`Terjadi kesalahan jaringan: ${error.message}`, 'error');
        return false; // Indicate failure
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

function initializeExportCsv() {
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            exportToCsv();
        });
    }
}

function exportToCsv() {
    const selectedCommentIds = Array.from(document.querySelectorAll('.row-select:checked'))
                                .map(checkbox => checkbox.closest('tr').dataset.commentId);

    if (selectedCommentIds.length === 0) {
        showNotification('Pilih setidaknya satu komentar untuk diekspor.', 'warning');
        return;
    }

    showNotification('Mempersiapkan data untuk ekspor...', 'info');
    fetch('/export-csv', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment_ids: selectedCommentIds })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.error || 'Terjadi kesalahan saat mengekspor data.');
                });
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'hasil_klasifikasi.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('Data berhasil diekspor ke CSV!', 'success');
        })
        .catch(error => {
            console.error('Export CSV Error:', error);
            showNotification(error.message, 'error');
        });
}