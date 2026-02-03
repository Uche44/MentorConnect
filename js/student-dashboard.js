
// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication and role
  if (!requireRole('student')) return;
  
  // Load dashboard data
  loadStudentDashboard();
  
  // Setup event listeners
  setupEventListeners();
});


// ========================================
// DASHBOARD LOADING
// ========================================

function loadStudentDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Update user info in sidebar
  updateUserInfo(currentUser);
  
  // Load stats
  loadStudentStats(currentUser.id);
  
  // Load mentors
  loadMentors();
  
  // Load appointments
  loadStudentAppointments(currentUser.id);
}

/**
 * Update user info in sidebar
 */
function updateUserInfo(user) {
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  
  if (userAvatar) {
    userAvatar.innerHTML = generateAvatar(user, 'md');
  }
  
  if (userName) {
    userName.textContent = `${user.firstName} ${user.lastName}`;
  }
  
  if (userRole) {
    userRole.textContent = 'Student';
  }
}

/**
 * Load student statistics
 */
async function loadStudentStats(studentId) {
  try {
    const appointments = await getUserAppointmentsFromServer(studentId, 'student');
    const upcoming = await getUpcomingAppointmentsFromServer(studentId, 'student');
    const completed = appointments.filter(apt => apt.status === 'completed');
    const mentors = new Set(appointments.map(apt => apt.mentorId));
    
    // Update stat cards
    updateStatCard('upcomingCount', upcoming.length);
    updateStatCard('completedCount', completed.length);
    updateStatCard('mentorsCount', mentors.size);
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
// MENTORS SECTION
// ========================================

let allMentors = [];
let filteredMentors = [];

/**
 * Load and display mentors
 */
async function loadMentors() {
  try {
    // Fetch mentors from JSON Server
    allMentors = await getMentorsFromServer();
    filteredMentors = [...allMentors];
    renderMentors();
  } catch (error) {
    console.error('Failed to load mentors:', error);
    showToast('Failed to load mentors', 'error');
  }
}

/**
 * Render mentor cards
 */
function renderMentors() {
  const container = document.getElementById('mentorsGrid');
  if (!container) return;
  
  if (filteredMentors.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <h3 class="empty-state-title">No mentors found</h3>
        <p class="empty-state-message">Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredMentors.map(mentor => `
    <div class="mentor-card">
      ${generateAvatar(mentor, 'xl')}
      <h3 class="mentor-card-name">${mentor.firstName} ${mentor.lastName}</h3>
      <p class="mentor-card-title">${mentor.specialty.join(' • ')}</p>
      <div class="mentor-card-specialties">
        ${mentor.specialty.map(s => `<span class="badge badge-primary">${s}</span>`).join('')}
      </div>
      <p class="mentor-card-bio">${mentor.bio}</p>
      <button class="btn btn-primary btn-full" onclick="openScheduleModal('${mentor.id}')">
        Schedule Session
      </button>
    </div>
  `).join('');
}

/**
 * Search mentors
 */
function searchMentors(searchTerm) {
  filteredMentors = searchArray(allMentors, searchTerm, ['firstName', 'lastName', 'bio', 'specialty']);
  renderMentors();
}

/**
 * Filter mentors by specialty
 */
function filterMentorsBySpecialty(specialty) {
  if (!specialty || specialty === 'all') {
    filteredMentors = [...allMentors];
  } else {
    filteredMentors = allMentors.filter(mentor => 
      mentor.specialty.includes(specialty)
    );
  }
  renderMentors();
}

// ========================================
// APPOINTMENTS SECTION
// ========================================

/**
 * Load student appointments
 */
async function loadStudentAppointments(studentId) {
  try {
    const upcoming = await getUpcomingAppointmentsFromServer(studentId, 'student');
    const past = await getPastAppointmentsFromServer(studentId, 'student');
    
    await renderAppointments('upcomingAppointments', upcoming, 'student');
    await renderAppointments('pastAppointments', past, 'student');
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
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3 class="empty-state-title">No appointments</h3>
        <p class="empty-state-message">
          ${containerId === 'upcomingAppointments' 
            ? 'Schedule a session with a mentor to get started' 
            : 'Your completed appointments will appear here'}
        </p>
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
// SCHEDULE MODAL
// ========================================

let selectedMentorId = null;

/**
 * Open schedule appointment modal
 */
function openScheduleModal(mentorId) {
  console.log('openScheduleModal called with mentorId:', mentorId);
  
  // Check authentication
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to schedule an appointment', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1000);
    return;
  }
  
  selectedMentorId = mentorId;
  
  // Find mentor from the allMentors array (fetched from JSON Server)
  const mentor = allMentors.find(m => m.id === mentorId);
  
  console.log('Mentor found:', mentor);
  
  if (!mentor) {
    console.error('Mentor not found for ID:', mentorId);
    showToast('Mentor not found', 'error');
    return;
  }
  
  // Update modal content
  document.getElementById('modalMentorName').textContent = 
    `${mentor.firstName} ${mentor.lastName}`;
  
  // Reset form
  document.getElementById('scheduleForm').reset();
  selectedDate = null;
  selectedTimeSlot = null;
  
  // Render calendar
  currentCalendarMonth = new Date().getMonth();
  currentCalendarYear = new Date().getFullYear();
  renderCalendar('calendarContainer', currentCalendarYear, currentCalendarMonth);
  
  // Clear time slots
  document.getElementById('timeSlotsContainer').innerHTML = 
    '<p class="text-center text-secondary">Please select a date</p>';
  
  // Setup date selection callback
  window.onDateSelected = (date) => {
    renderTimeSlots('timeSlotsContainer', mentor, date);
  };
  
  // Open modal
  console.log('Opening modal...');
  openModal('scheduleModal');
  console.log('Modal opened');
}

// Make globally accessible for inline onclick handlers
window.openScheduleModal = openScheduleModal;
window.closeModal = closeModal;



/**
 * Handle schedule form submission
 */
async function handleScheduleSubmit(event) {
  event.preventDefault();
  
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  if (!selectedDate) {
    showToast('Please select a date', 'error');
    return;
  }
  
  if (!selectedTimeSlot) {
    showToast('Please select a time slot', 'error');
    return;
  }
  
  const type = document.getElementById('appointmentType').value;
  const meetingType = document.getElementById('meetingType').value;
  const notes = document.getElementById('appointmentNotes').value.trim();
  
  if (!type) {
    showToast('Please select an appointment type', 'error');
    return;
  }
  
  if (!meetingType) {
    showToast('Please select a meeting type', 'error');
    return;
  }
  
  let location = '';
  let meetingLink = '';
  
  if (meetingType === 'virtual') {
    meetingLink = document.getElementById('meetingLink').value.trim();
    if (!meetingLink) {
      showToast('Please enter a meeting link', 'error');
      return;
    }
  } else if (meetingType === 'physical') {
    location = document.getElementById('location').value.trim();
    if (!location) {
      showToast('Please enter a location', 'error');
      return;
    }
  }
  
  try {
    // Check for conflicts
    const hasConflict = await checkAppointmentConflict(
      selectedMentorId,
      selectedDate,
      selectedTimeSlot
    );
    
    if (hasConflict) {
      showToast('This time slot is already booked', 'error');
      return;
    }
    
    // Create appointment on server
    const appointment = await createAppointmentOnServer({
      studentId: currentUser.id,
      mentorId: selectedMentorId,
      date: selectedDate,
      time: selectedTimeSlot,
      duration: 60,
      type: type,
      meetingType: meetingType,
      location: location,
      meetingLink: meetingLink,
      notes: notes
    });
    
    if (appointment) {
      showToast('Appointment requested successfully!', 'success');
      closeModal('scheduleModal');
      
      // Reload appointments and stats
      setTimeout(async () => {
        await loadStudentAppointments(currentUser.id);
        await loadStudentStats(currentUser.id);
      }, 500);
    }
  } catch (error) {
    showToast('Failed to create appointment: ' + error.message, 'error');
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('mentorSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      searchMentors(e.target.value);
    }, 300));
  }
  
  // Filter
  const filterSelect = document.getElementById('specialtyFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      filterMentorsBySpecialty(e.target.value);
    });
  }
  
  // Meeting type toggle
  const meetingTypeSelect = document.getElementById('meetingType');
  if (meetingTypeSelect) {
    meetingTypeSelect.addEventListener('change', (e) => {
      const meetingLinkGroup = document.getElementById('meetingLinkGroup');
      const locationGroup = document.getElementById('locationGroup');
      const meetingLinkInput = document.getElementById('meetingLink');
      const locationInput = document.getElementById('location');
      
      if (e.target.value === 'virtual') {
        meetingLinkGroup.classList.remove('hidden');
        locationGroup.classList.add('hidden');
        meetingLinkInput.required = true;
        locationInput.required = false;
        locationInput.value = '';
      } else if (e.target.value === 'physical') {
        locationGroup.classList.remove('hidden');
        meetingLinkGroup.classList.add('hidden');
        locationInput.required = true;
        meetingLinkInput.required = false;
        meetingLinkInput.value = '';
      } else {
        meetingLinkGroup.classList.add('hidden');
        locationGroup.classList.add('hidden');
        meetingLinkInput.required = false;
        locationInput.required = false;
      }
    });
  }
  
  // Schedule form
  const scheduleForm = document.getElementById('scheduleForm');
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', handleScheduleSubmit);
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
