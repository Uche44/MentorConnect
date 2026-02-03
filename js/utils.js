/**
 * UTILITY FUNCTIONS
 * Helper functions for common tasks
 */


// DATE & TIME UTILITIES


/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'full'
 */
function formatDate(date, format = 'short') {
  const d = new Date(date);
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Format time to 12-hour format
 */
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
function getRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = then - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 0) {
    // Past
    const absMins = Math.abs(diffMins);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    
    if (absMins < 60) return `${absMins} minute${absMins !== 1 ? 's' : ''} ago`;
    if (absHours < 24) return `${absHours} hour${absHours !== 1 ? 's' : ''} ago`;
    if (absDays < 7) return `${absDays} day${absDays !== 1 ? 's' : ''} ago`;
    return formatDate(date);
  } else {
    // Future
    if (diffMins < 60) return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    return formatDate(date);
  }
}

/**
 * Check if date is today
 */
function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is in the past
 */
function isPast(date, time = '00:00') {
  const dateTime = new Date(`${date}T${time}`);
  return dateTime < new Date();
}

/**
 * Get date range for calendar
 */
function getDateRange(startDate, days) {
  const dates = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}


// FORM VALIDATION


/**
 * Validate email format
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
  const regex = /^[\d\s\-\(\)]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate required field
 */
function isRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}


// TOAST NOTIFICATIONS


/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


// MODAL MANAGEMENT


/**
 * Open modal
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close modal
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Close modal on overlay click
 */
function setupModalClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}


// AVATAR UTILITIES


/**
 * Generate initials from name
 */
function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
}

/**
 * Generate avatar HTML
 */
function generateAvatar(user, size = 'md') {
  if (user.avatar) {
    return `<div class="avatar avatar-${size}"><img src="${user.avatar}" alt="${user.firstName} ${user.lastName}"></div>`;
  }
  
  const initials = getInitials(user.firstName, user.lastName);
  return `<div class="avatar avatar-${size}">${initials}</div>`;
}


// SEARCH & FILTER


/**
 * Filter array by search term
 */
function searchArray(array, searchTerm, fields) {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) return array;
  
  return array.filter(item => {
    return fields.some(field => {
      const value = getNestedValue(item, field);
      return value && value.toString().toLowerCase().includes(term);
    });
  });
}

/**
 * Get nested object value by path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Filter array by multiple criteria
 */
function filterArray(array, filters) {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;
      
      const itemValue = getNestedValue(item, key);
      
      if (Array.isArray(itemValue)) {
        return itemValue.includes(value);
      }
      
      return itemValue === value;
    });
  });
}


// DOM UTILITIES


/**
 * Safely get element by ID
 */
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID "${id}" not found`);
  }
  return element;
}

/**
 * Create element with attributes and content
 */
function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (content) {
    element.innerHTML = content;
  }
  
  return element;
}

/**
 * Debounce function
 */
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


// AUTHENTICATION GUARDS


/**
 * Redirect if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

/**
 * Redirect if authenticated
 */
function requireGuest() {
  if (isAuthenticated()) {
    const user = getCurrentUser();
    redirectToDashboard(user.role);
    return false;
  }
  return true;
}

/**
 * Redirect to appropriate dashboard
 */
function redirectToDashboard(role) {
  if (role === 'student') {
    window.location.href = 'student-dashboard.html';
  } else if (role === 'mentor') {
    window.location.href = 'mentor-dashboard.html';
  }
}

/**
 * Require specific role
 */
function requireRole(requiredRole) {
  if (!requireAuth()) return false;
  
  const user = getCurrentUser();
  if (user.role !== requiredRole) {
    redirectToDashboard(user.role);
    return false;
  }
  return true;
}


// LOCAL STORAGE HELPERS


/**
 * Safely get from localStorage
 */
function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Safely set to localStorage
 */
function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}


// INITIALIZATION


// Setup modal close handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupModalClose();
});
