// Dashboard Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Mobile sidebar toggle
    initializeMobileSidebar();
    
    // Animation effects
    initializeAnimations();
    
    // Statistics counter animation
    animateCounters();
});

function initializeDashboard() {
    // Add active states and interactions
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Handle navigation
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initializeMobileSidebar() {
    // Create mobile menu toggle button
    const navbar = document.querySelector('.navbar .container-fluid');
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-menu-toggle';
    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
    toggleButton.setAttribute('type', 'button');
    
    // Insert toggle button after brand
    const brand = navbar.querySelector('.navbar-brand');
    brand.parentNode.insertBefore(toggleButton, brand.nextSibling);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    const sidebar = document.querySelector('.sidebar');
    
    // Toggle sidebar
    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        document.body.classList.toggle('sidebar-open');
    });
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    });
    
    // Close sidebar when clicking nav links on mobile
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                document.body.classList.remove('sidebar-open');
            }
        });
    });
}

function initializeAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.stat-card, .comment-item, .content-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// Coming soon functionality for placeholder menu items
function showComingSoon(feature) {
    // Create modal for coming soon message
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Fitur Segera Hadir</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-3">
                        <i class="fas fa-clock" style="font-size: 3rem; color: #28a745;"></i>
                    </div>
                    <h6>Fitur "${feature}" sedang dalam pengembangan</h6>
                    <p class="text-muted">Kami sedang bekerja keras untuk menghadirkan fitur ini. Nantikan pembaruan selanjutnya!</p>
                </div>
                <div class="modal-footer justify-content-center">
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal">Mengerti</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
}

// Search functionality (if needed)
function initializeSearch() {
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const comments = document.querySelectorAll('.comment-item');
            
            comments.forEach(comment => {
                const text = comment.querySelector('.comment-text').textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    comment.style.display = 'flex';
                } else {
                    comment.style.display = 'none';
                }
            });
        });
    }
}

// Refresh data functionality
function refreshDashboard() {
    // Add loading state
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.classList.add('loading-skeleton');
    });
    
    // Simulate data refresh
    setTimeout(() => {
        statCards.forEach(card => {
            card.classList.remove('loading-skeleton');
        });
        
        // Show success message
        showNotification('Data berhasil diperbarui', 'success');
    }, 1500);
}

// Notification system
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

// Export/download functionality (placeholder)
function exportData(type) {
    showNotification('Fitur ekspor data sedang dalam pengembangan', 'info');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }
});

// Theme toggle (if needed in future)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}

// Performance monitoring
function trackPageLoad() {
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Dashboard loaded in ${Math.round(loadTime)}ms`);
    });
}

// Initialize performance tracking
trackPageLoad();