// Data Latih Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page functionality
    initializeDataTable();
    initializeSearch();
    initializePagination();
    initializeImportModal();
    initializeCheckboxes();
    initializeDeleteButtons();
});

function initializeDataTable() {
    // Add sorting functionality to table headers
    const sortableHeaders = document.querySelectorAll('.data-table th');
    sortableHeaders.forEach(header => {
        if (header.classList.contains('no-column') || header.classList.contains('comment-column') || header.classList.contains('label-column')) {
            header.classList.add('sortable');
            header.addEventListener('click', function() {
                sortTable(this);
            });
        }
    });
    
    // Add hover effects to table rows
    const tableRows = document.querySelectorAll('.data-table tbody tr');
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
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBox = searchInput.closest('.search-box');
    const clearSearchBtn = document.createElement('button');


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
    console.log('Filtering table with search term:', searchTerm);
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const commentTextElement = row.querySelector('.comment-text');
        const labelElement = row.querySelector('.label-badge');
        
        const commentText = (commentTextElement?.textContent || '').toLowerCase();
        const label = (labelElement?.textContent || '').toLowerCase();
        
        if (commentText.includes(searchTerm) || label.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
            console.log('Showing row:', row, 'Comment:', commentText, 'Label:', label);
        } else {
            row.style.display = 'none';
            console.log('Hiding row:', row, 'Comment:', commentText, 'Label:', label);
        }
    });
    
    // Update pagination info
    updatePaginationInfo(visibleCount);
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
    // In a real application, this would make an API call
    // For demo purposes, we'll just update the display
    console.log(`Updating pagination to show ${rowsPerPage} rows per page`);
    showNotification(`Menampilkan ${rowsPerPage} baris per halaman`, 'info');
}

function navigatePage(direction) {
    // In a real application, this would navigate to different pages
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
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const row = checkbox.closest('tr');
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
    const rowCheckboxes = document.querySelectorAll('.row-select');
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedCount === rowCheckboxes.length) {
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

function sortTable(header) {
    const columnIndex = Array.from(header.parentNode.children).indexOf(header);
    const tableBody = document.querySelector('.data-table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    // Determine sort direction
    const isAscending = !header.classList.contains('sort-asc');
    
    // Clear previous sort indicators
    document.querySelectorAll('.sortable').forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Add sort indicator to current header
    header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        // Check if values are numbers
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return isAscending ? aNum - bNum : bNum - aNum;
        } else {
            return isAscending ? 
                aValue.localeCompare(bValue) : 
                bValue.localeCompare(aValue);
        }
    });
    
    // Re-append sorted rows
    rows.forEach(row => tableBody.appendChild(row));
    
    showNotification(`Tabel diurutkan berdasarkan ${header.textContent}`, 'info');
}

function initializeImportModal() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('csvFile');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Click to select file
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFileSelection(this.files[0]);
        }
    });
    
    // Upload button
    uploadBtn.addEventListener('click', function() {
        uploadFile();
    });
}

function handleFileSelection(file) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        uploadArea.classList.add('file-selected');
        uploadArea.querySelector('h6').textContent = `File dipilih: ${file.name}`;
        uploadArea.querySelector('p').textContent = `Ukuran: ${formatFileSize(file.size)}`;
        uploadBtn.disabled = false;
    } else {
        showNotification('Hanya file CSV yang diperbolehkan', 'error');
        resetFileSelection();
    }
}

function resetFileSelection() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('csvFile');
    
    uploadArea.classList.remove('file-selected');
    uploadArea.querySelector('h6').textContent = 'Drag & drop CSV file here';
    uploadArea.querySelector('p').textContent = 'atau klik untuk memilih file';
    uploadBtn.disabled = true;
    fileInput.value = '';
}

function uploadFile() {
    const fileInput = document.getElementById('csvFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const importModal = bootstrap.Modal.getInstance(document.getElementById('importModal'));

    if (fileInput.files.length === 0) {
        showNotification('Silakan pilih file terlebih dahulu', 'warning');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('csv_file', file);

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';

    fetch('/upload_data_latih', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            importModal.hide();
            resetFileSelection();
            // Optionally, refresh data table here if needed
            // For now, assume a page refresh or separate data load will handle it
            location.reload(); // Simple reload to show updated data
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan saat mengunggah file.', 'error');
    })
    .finally(() => {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = 'Upload Data';
    });
}

function addSimulatedData() {
    // In a real application, this would refresh the table with new data
    showNotification('5 data baru ditambahkan ke tabel', 'info');
}

function showImportModal() {
    const modal = new bootstrap.Modal(document.getElementById('importModal'));
    modal.show();
}

function deleteSelected() {
    const selectedCommentIds = Array.from(document.querySelectorAll('.row-select:checked'))
                                .map(checkbox => checkbox.closest('tr').dataset.commentId);
    
    if (selectedCommentIds.length === 0) {
        showNotification('Pilih setidaknya satu komentar untuk dihapus.', 'warning');
        return;
    }

    if (confirm(`Anda yakin ingin menghapus ${selectedCommentIds.length} komentar terpilih?`)) {
        // Iterate and delete each selected comment
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
                    showNotification(`${deletedCount} komentar berhasil dihapus.`, 'success');
                }
                if (failedCount > 0) {
                    showNotification(`${failedCount} komentar gagal dihapus.`, 'error');
                }
                // Refresh the page or update the table after all deletions are attempted
                location.reload(); 
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
            if (confirm('Anda yakin ingin menghapus komentar ini?')) {
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
            // Remove the row from the table
            const rowToRemove = document.querySelector(`tr[data-comment-id="${commentId}"]`);
            if (rowToRemove) {
                rowToRemove.remove();
                // Update counts/pagination if necessary
                updatePaginationInfo(document.querySelectorAll('.data-table tbody tr').length); // Simple re-count
                updateSelectAllState();
                updateBulkActions();
            }
            return true; // Indicate success
        } else {
            showNotification(data.message || 'Gagal menghapus komentar.', 'error');
            return false; // Indicate failure
        }
    } catch (error) {
        showNotification(`Terjadi kesalahan jaringan: ${error.message}`, 'error');
        return false; // Indicate failure
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    // Ctrl/Cmd + A to select all
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
    
    // Ctrl/Cmd + I to import
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        showImportModal();
    }
});