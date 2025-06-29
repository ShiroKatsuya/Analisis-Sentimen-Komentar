// Data Latih Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page functionality
    initializeDataTable();
    initializeSearch();
    initializePagination();
    initializeImportModal();
    initializeCheckboxes();
});

function initializeDataTable() {
    // Add sorting functionality to table headers
    const sortableHeaders = document.querySelectorAll('.data-table th');
    sortableHeaders.forEach(header => {
        if (header.classList.contains('no-column') || header.classList.contains('comment-column')) {
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
            if (!e.target.matches('input[type="checkbox"]')) {
                const checkbox = this.querySelector('.row-select');
                checkbox.checked = !checkbox.checked;
                toggleRowSelection(this, checkbox.checked);
                updateBulkActions();
            }
        });
    });
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
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const commentText = row.querySelector('.comment-text').textContent.toLowerCase();
        const label = row.querySelector('.label-badge').textContent.toLowerCase();
        
        if (commentText.includes(searchTerm) || label.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update pagination info
    updatePaginationInfo(visibleCount);
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
            ${count} item dipilih
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteSelected()">
            <i class="fas fa-trash me-1"></i>Hapus
        </button>
        <button class="btn btn-sm btn-outline-primary" onclick="exportSelected()">
            <i class="fas fa-download me-1"></i>Export
        </button>
    `;
    
    const tableSection = document.querySelector('.data-table-section');
    const tableContainer = document.querySelector('.table-container');
    tableSection.insertBefore(bulkActions, tableContainer);
}

function updateBulkActionsText(count) {
    const bulkActionsText = document.querySelector('.bulk-actions-text');
    if (bulkActionsText) {
        bulkActionsText.textContent = `${count} item dipilih`;
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
    
    if (fileInput.files.length === 0) {
        showNotification('Silakan pilih file terlebih dahulu', 'warning');
        return;
    }
    
    // Simulate file upload
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';
    
    setTimeout(() => {
        showNotification('Data berhasil diimport!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
        modal.hide();
        resetFileSelection();
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = 'Upload Data';
        
        // Simulate adding new data to table
        addSimulatedData();
    }, 2000);
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
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${checkedCount} item yang dipilih?`)) {
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
            showNotification(`${checkedCount} item berhasil dihapus`, 'success');
        }, 400);
    }
}

function exportSelected() {
    const checkedCount = document.querySelectorAll('.row-select:checked').length;
    showNotification(`Mengexport ${checkedCount} item yang dipilih...`, 'info');
    
    // Simulate export process
    setTimeout(() => {
        showNotification('Data berhasil diexport ke CSV', 'success');
    }, 1500);
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