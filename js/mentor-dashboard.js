/**
 * MENTOR DASHBOARD
 * Mentor-specific dashboard functionality
 */

// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication and role
  if (!requireRole('mentor')) return;
  
  // Load dashboard data
  loadMentorDashboard();
  
  // Setup event listeners
  setupEventListeners();
});

// ========================================
// DASHBOARD LOADING
// ========================================

function loadMentorDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Update user info in sidebar
  updateUserInfo(currentUser);
  
  // Load stats
  loadMentorStats(currentUser.id);
  
  // Load appointments
  loadMentorAppointments(currentUser.id);
}

/**
 * Update user info in sidebar
 */
function updateUserInfo(user) {
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const userSpecialty = document.getElementById('userSpecialty');
  
  if (userAvatar) {
    userAvatar.innerHTML = generateAvatar(user, 'md');
  }
  
  if (userName) {
    userName.textContent = `${user.firstName} ${user.lastName}`;
  }
  
  if (userRole) {
    userRole.textContent = 'Mentor';
  }
  
  if (userSpecialty) {
    userSpecialty.textContent = user.specialty.join(' • ');
  }
}

/**
 * Load mentor statistics
 */
async function loadMentorStats(mentorId) {
  try {
    const appointments = await getUserAppointmentsFromServer(mentorId, 'mentor');
    const upcoming = await getUpcomingAppointmentsFromServer(mentorId, 'mentor');
    const completed = appointments.filter(apt => apt.status === 'completed');
    const pending = appointments.filter(apt => apt.status === 'pending');
    const students = new Set(appointments.map(apt => apt.studentId));
    
    // Update stat cards
    updateStatCard('upcomingCount', upcoming.length);
    updateStatCard('completedCount', completed.length);
    updateStatCard('studentsCount', students.size);
    updateStatCard('pendingCount', pending.length);
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function updateStatCard(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

// ========================================
// APPOINTMENTS SECTION
// ========================================

/**
 * Load mentor appointments
 */
async function loadMentorAppointments(mentorId) {
  try {
    const all = await getUserAppointmentsFromServer(mentorId, 'mentor');
    const pending = all.filter(apt => apt.status === 'pending');
    const upcoming = (await getUpcomingAppointmentsFromServer(mentorId, 'mentor'))
      .filter(apt => apt.status !== 'pending');
    const past = await getPastAppointmentsFromServer(mentorId, 'mentor');
    
    await renderAppointments('pendingAppointments', pending, 'mentor');
    await renderAppointments('upcomingAppointments', upcoming, 'mentor');
    await renderAppointments('pastAppointments', past, 'mentor');
  } catch (error) {
    console.error('Failed to load appointments:', error);
    showToast('Failed to load appointments', 'error');
  }
}

/**
 * Render appointments
 */
async function renderAppointments(containerId, appointments, userRole) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (appointments.length === 0) {
    const messages = {
      pendingAppointments: 'No pending appointment requests',
      upcomingAppointments: 'No upcoming sessions scheduled',
      pastAppointments: 'No past sessions yet'
    };
    
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3 class="empty-state-title">No appointments</h3>
        <p class="empty-state-message">${messages[containerId]}</p>
      </div>
    `;
    return;
  }
  
  // Render all appointment cards (async)
  const cardPromises = appointments.map(apt => renderAppointmentCard(apt, userRole));
  const cards = await Promise.all(cardPromises);
  
  container.innerHTML = cards.filter(card => card !== '').join('');
}

// ========================================
// PROFILE MANAGEMENT
// ========================================

/**
 * Open edit profile modal
 */
function openEditProfileModal() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Populate form with current data
  document.getElementById('editFirstName').value = currentUser.firstName;
  document.getElementById('editLastName').value = currentUser.lastName;
  document.getElementById('editPhone').value = currentUser.phone;
  document.getElementById('editBio').value = currentUser.bio || '';
  
  // Set specialty checkboxes
  document.querySelectorAll('input[name="editSpecialty"]').forEach(checkbox => {
    checkbox.checked = currentUser.specialty.includes(checkbox.value);
  });
  
  openModal('editProfileModal');
}

/**
 * Handle profile update
 */
function handleProfileUpdate(event) {
  event.preventDefault();
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const formData = {
    firstName: document.getElementById('editFirstName').value.trim(),
    lastName: document.getElementById('editLastName').value.trim(),
    phone: document.getElementById('editPhone').value.trim(),
    bio: document.getElementById('editBio').value.trim(),
    specialty: []
  };
  
  // Get selected specialties
  document.querySelectorAll('input[name="editSpecialty"]:checked').forEach(checkbox => {
    formData.specialty.push(checkbox.value);
  });
  
  // Validate
  if (!formData.firstName || !formData.lastName) {
    showToast('First name and last name are required', 'error');
    return;
  }
  
  if (formData.specialty.length === 0) {
    showToast('Please select at least one specialty', 'error');
    return;
  }
  
  try {
    // Update user
    updateUser(currentUser.id, formData);
    
    showToast('Profile updated successfully', 'success');
    closeModal('editProfileModal');
    
    // Reload dashboard
    setTimeout(() => {
      location.reload();
    }, 500);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ========================================
// AVAILABILITY MANAGEMENT
// ========================================

/**
 * Open manage availability modal
 */
function openAvailabilityModal() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Render current availability
  renderAvailabilityList(currentUser.availability || []);
  
  openModal('availabilityModal');
}

/**
 * Render availability list
 */
function renderAvailabilityList(availability) {
  const container = document.getElementById('availabilityList');
  if (!container) return;
  
  if (availability.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="text-center text-secondary">No availability set</p>
      </div>
    `;
    return;
  }
  
  // Group by date
  const grouped = availability.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});
  
  // Sort dates
  const sortedDates = Object.keys(grouped).sort();
  
  container.innerHTML = sortedDates.map(date => `
    <div class="mb-lg">
      <h4 class="text-lg font-semibold mb-sm">${formatDate(date, 'long')}</h4>
      <div class="flex gap-sm" style="flex-wrap: wrap;">
        ${grouped[date].map(slot => `
          <span class="badge badge-primary">${formatTime(slot.time)}</span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Regenerate availability
 */
function regenerateAvailability() {
  if (!confirm('This will replace your current availability. Continue?')) {
    return;
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  try {
    const newAvailability = generateAvailability();
    updateUser(currentUser.id, { availability: newAvailability });
    
    showToast('Availability updated successfully', 'success');
    renderAvailabilityList(newAvailability);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Edit profile button
  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', openEditProfileModal);
  }
  
  // Profile form
  const profileForm = document.getElementById('editProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  // Manage availability button
  const manageAvailabilityBtn = document.getElementById('manageAvailabilityBtn');
  if (manageAvailabilityBtn) {
    manageAvailabilityBtn.addEventListener('click', openAvailabilityModal);
  }
  
  // Regenerate availability button
  const regenerateBtn = document.getElementById('regenerateAvailabilityBtn');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', regenerateAvailability);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        clearCurrentUser();
        window.location.href = 'index.html';
      }
    });
  }
}
