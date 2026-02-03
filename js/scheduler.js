/**
 * SCHEDULER
 * Appointment scheduling functionality
 */

// ========================================
// CALENDAR RENDERING
// ========================================

/**
 * Render calendar for a given month
 */
function renderCalendar(containerId, year, month, onDateSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  let html = `
    <div class="calendar">
      <div class="calendar-header">
        <button class="btn btn-ghost btn-sm" onclick="changeMonth(-1)">←</button>
        <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
        <button class="btn btn-ghost btn-sm" onclick="changeMonth(1)">→</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
  `;
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    html += '<div class="calendar-day"></div>';
  }
  
  // Days of the month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();
    const isPastDate = date < today && !isToday;
    
    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${isPastDate ? 'past' : ''}" 
           data-date="${dateStr}"
           onclick="handleDateSelect('${dateStr}')">
        ${day}
      </div>
    `;
  }
  
  html += '</div></div>';
  container.innerHTML = html;
}

// ========================================
// TIME SLOT RENDERING
// ========================================

/**
 * Render available time slots for a mentor on a specific date
 */
function renderTimeSlots(containerId, mentor, date) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!mentor || !mentor.availability) {
    container.innerHTML = '<p class="text-center text-secondary">No availability found</p>';
    return;
  }
  
  // Get available slots for this date
  const availableSlots = mentor.availability.filter(slot => slot.date === date);
  
  if (availableSlots.length === 0) {
    container.innerHTML = '<p class="text-center text-secondary">No available time slots for this date</p>';
    return;
  }
  
  // Get existing appointments for this mentor on this date
  const existingAppointments = getAllAppointments().filter(apt => 
    apt.mentorId === mentor.id && 
    apt.date === date && 
    apt.status !== 'cancelled'
  );
  
  const bookedTimes = existingAppointments.map(apt => apt.time);
  
  // Render time slots
  let html = '<div class="time-slots">';
  
  availableSlots.forEach(slot => {
    const isBooked = bookedTimes.includes(slot.time);
    const isPastTime = isPast(date, slot.time);
    const isDisabled = isBooked || isPastTime;
    
    html += `
      <div class="time-slot ${isDisabled ? 'disabled' : ''}" 
           data-time="${slot.time}"
           onclick="${!isDisabled ? `selectTimeSlot('${slot.time}')` : ''}">
        ${formatTime(slot.time)}
        ${isBooked ? '<br><small>Booked</small>' : ''}
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Handle time slot selection
 */
let selectedTimeSlot = null;

function selectTimeSlot(time) {
  // Remove previous selection
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  // Add selection to clicked slot
  const slot = document.querySelector(`.time-slot[data-time="${time}"]`);
  if (slot) {
    slot.classList.add('selected');
    selectedTimeSlot = time;
  }
}

// ========================================
// APPOINTMENT BOOKING
// ========================================

/**
 * Book an appointment
 */
function bookAppointment(studentId, mentorId, date, time, type, notes = '') {
  try {
    // Validate inputs
    if (!studentId || !mentorId || !date || !time || !type) {
      throw new Error('All fields are required');
    }
    
    // Check if time is in the past
    if (isPast(date, time)) {
      throw new Error('Cannot book appointments in the past');
    }
    
    // Create appointment
    const appointment = createAppointment({
      studentId,
      mentorId,
      date,
      time,
      duration: 60,
      type,
      notes,
      meetingLink: ''
    });
    
    showToast('Appointment requested successfully!', 'success');
    return appointment;
    
  } catch (error) {
    showToast(error.message, 'error');
    return null;
  }
}

// ========================================
// APPOINTMENT ACTIONS
// ========================================

/**
 * Cancel appointment
 */
async function handleCancelAppointment(appointmentId) {
  if (!confirm('Are you sure you want to cancel this appointment?')) {
    return;
  }
  
  try {
    await cancelAppointmentOnServer(appointmentId);
    showToast('Appointment cancelled', 'success');
    
    // Reload page to reflect changes
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/**
 * Confirm appointment (mentor only)
 */
async function handleConfirmAppointment(appointmentId) {
  try {
    await confirmAppointmentOnServer(appointmentId);
    showToast('Appointment confirmed', 'success');
    
    // Reload page to reflect changes
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/**
 * Decline appointment (mentor only)
 */
async function handleDeclineAppointment(appointmentId) {
  if (!confirm('Are you sure you want to decline this appointment?')) {
    return;
  }
  
  try {
    await cancelAppointmentOnServer(appointmentId);
    showToast('Appointment declined', 'success');
    
    // Reload page to reflect changes
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Make handlers globally accessible for inline onclick
window.handleCancelAppointment = handleCancelAppointment;
window.handleConfirmAppointment = handleConfirmAppointment;
window.handleDeclineAppointment = handleDeclineAppointment;

/**
 * Mark appointment as completed
 */
function handleCompleteAppointment(appointmentId) {
  try {
    completeAppointment(appointmentId);
    showToast('Appointment marked as completed', 'success');
    
    // Reload page to reflect changes
    setTimeout(() => {
      location.reload();
    }, 1000);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ========================================
// APPOINTMENT CARD RENDERING
// ========================================

/**
 * Render appointment card
 */
async function renderAppointmentCard(appointment, userRole) {
  // Fetch user data from server
  const student = await getUserFromServer(appointment.studentId);
  const mentor = await getUserFromServer(appointment.mentorId);
  
  if (!student || !mentor) {
    console.error('Could not fetch user data for appointment:', appointment.id);
    return '';
  }
  
  const otherUser = userRole === 'student' ? mentor : student;
  const dateTime = new Date(`${appointment.date}T${appointment.time}`);
  const isPastAppointment = dateTime < new Date();
  
  let actions = '';
  
  if (!isPastAppointment) {
    if (userRole === 'student') {
      if (appointment.status !== 'cancelled') {
        actions = `
          <button class="btn btn-sm btn-outline" onclick="handleCancelAppointment('${appointment.id}')">
            Cancel
          </button>
        `;
      }
    } else if (userRole === 'mentor') {
      if (appointment.status === 'pending') {
        actions = `
          <button class="btn btn-sm btn-primary" onclick="handleConfirmAppointment('${appointment.id}')">
            Confirm
          </button>
          <button class="btn btn-sm btn-outline" onclick="handleDeclineAppointment('${appointment.id}')">
            Decline
          </button>
        `;
      } else if (appointment.status === 'confirmed') {
        actions = `
          <button class="btn btn-sm btn-outline" onclick="handleCancelAppointment('${appointment.id}')">
            Cancel
          </button>
        `;
      }
    }
  }
  
  // Add meeting info
  let meetingInfo = '';
  if (appointment.meetingType === 'virtual' && appointment.meetingLink) {
    meetingInfo = `
      <div class="appointment-card-detail">
        <span class="appointment-card-detail-icon">🔗</span>
        <a href="${appointment.meetingLink}" target="_blank" class="text-primary">Join Virtual Meeting</a>
      </div>
    `;
  } else if (appointment.meetingType === 'physical' && appointment.location) {
    meetingInfo = `
      <div class="appointment-card-detail">
        <span class="appointment-card-detail-icon">📍</span>
        <span>${appointment.location}</span>
      </div>
    `;
  }
  
  return `
    <div class="appointment-card ${appointment.status}">
      <div class="appointment-card-header">
        <div class="appointment-card-user">
          ${generateAvatar(otherUser, 'md')}
          <div class="appointment-card-info">
            <h4>${otherUser.firstName} ${otherUser.lastName}</h4>
            <p>${userRole === 'student' ? otherUser.specialty.join(', ') : appointment.type}</p>
          </div>
        </div>
        <span class="badge badge-${getStatusBadgeType(appointment.status)}">
          ${appointment.status}
        </span>
      </div>
      <div class="appointment-card-body">
        <div class="appointment-card-detail">
          <span class="appointment-card-detail-icon">📅</span>
          <span>${formatDate(appointment.date, 'long')}</span>
        </div>
        <div class="appointment-card-detail">
          <span class="appointment-card-detail-icon">🕐</span>
          <span>${formatTime(appointment.time)} (${appointment.duration} min)</span>
        </div>
        ${meetingInfo}
        ${appointment.notes ? `
          <div class="appointment-card-detail">
            <span class="appointment-card-detail-icon">📝</span>
            <span>${appointment.notes}</span>
          </div>
        ` : ''}
      </div>
      ${actions ? `
        <div class="appointment-card-footer">
          ${actions}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Get badge type for appointment status
 */
function getStatusBadgeType(status) {
  const types = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'info',
    cancelled: 'error'
  };
  return types[status] || 'primary';
}

// ========================================
// CALENDAR STATE MANAGEMENT
// ========================================

let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let selectedDate = null;

function changeMonth(delta) {
  currentCalendarMonth += delta;
  
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  } else if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  
  renderCalendar('calendarContainer', currentCalendarYear, currentCalendarMonth);
}

function handleDateSelect(date) {
  selectedDate = date;
  
  // Update visual selection
  document.querySelectorAll('.calendar-day').forEach(day => {
    day.classList.remove('selected');
  });
  
  const selectedDay = document.querySelector(`.calendar-day[data-date="${date}"]`);
  if (selectedDay) {
    selectedDay.classList.add('selected');
  }
  
  // Trigger callback if exists
  if (window.onDateSelected) {
    window.onDateSelected(date);
  }
}
