/**
 * API SERVICE
 * Handles communication with JSON Server backend
 */

const API_BASE_URL = 'http://localhost:3000';

// ========================================
// API HELPER FUNCTIONS
// ========================================

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// ========================================
// USER API (Sync to JSON Server on signup)
// ========================================

/**
 * Sync user to JSON Server after signup
 */
async function syncUserToServer(user) {
  try {
    await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    console.log('User synced to server:', user.email);
  } catch (error) {
    console.error('Failed to sync user to server:', error);
    // Don't throw - localStorage signup still succeeded
  }
}

/**
 * Get user by ID from server
 */
async function getUserFromServer(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('User not found on server');
    }
    return await response.json();
  } catch (error) {
    console.warn('User not found on server, checking localStorage:', userId);
    // Fallback to localStorage
    const localUser = getUserById(userId);
    if (localUser) {
      console.log('Found user in localStorage:', localUser.email);
      return localUser;
    }
    console.error('User not found anywhere:', userId);
    return null;
  }
}

/**
 * Get all mentors from JSON Server
 */
async function getMentorsFromServer() {
  try {
    const users = await apiRequest('/users?role=mentor');
    return users;
  } catch (error) {
    console.error('Failed to fetch mentors from server:', error);
    // Fallback to localStorage
    return getAllMentors();
  }
}

// ========================================
// APPOINTMENT API (JSON Server only)
// ========================================

/**
 * Get all appointments from server
 */
async function getAppointmentsFromServer() {
  try {
    return await apiRequest('/appointments');
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
}

/**
 * Get appointments for a specific user
 */
async function getUserAppointmentsFromServer(userId, role) {
  try {
    const appointments = await getAppointmentsFromServer();
    
    if (role === 'student') {
      return appointments.filter(apt => apt.studentId === userId);
    } else if (role === 'mentor') {
      return appointments.filter(apt => apt.mentorId === userId);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch user appointments:', error);
    return [];
  }
}

/**
 * Create appointment on server
 */
async function createAppointmentOnServer(appointmentData) {
  try {
    const appointment = {
      id: generateId(),
      ...appointmentData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const created = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment)
    });
    
    return created;
  } catch (error) {
    console.error('Failed to create appointment:', error);
    throw error;
  }
}

/**
 * Update appointment on server
 */
async function updateAppointmentOnServer(appointmentId, updates) {
  try {
    const updated = await apiRequest(`/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString()
      })
    });
    
    return updated;
  } catch (error) {
    console.error('Failed to update appointment:', error);
    throw error;
  }
}

/**
 * Delete appointment from server
 */
async function deleteAppointmentFromServer(appointmentId) {
  try {
    await apiRequest(`/appointments/${appointmentId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    throw error;
  }
}

/**
 * Cancel appointment (update status)
 */
async function cancelAppointmentOnServer(appointmentId) {
  return updateAppointmentOnServer(appointmentId, { status: 'cancelled' });
}

/**
 * Confirm appointment (update status)
 */
async function confirmAppointmentOnServer(appointmentId) {
  return updateAppointmentOnServer(appointmentId, { status: 'confirmed' });
}

/**
 * Complete appointment (update status)
 */
async function completeAppointmentOnServer(appointmentId) {
  return updateAppointmentOnServer(appointmentId, { status: 'completed' });
}

/**
 * Get upcoming appointments from server
 */
async function getUpcomingAppointmentsFromServer(userId, role) {
  try {
    const appointments = await getUserAppointmentsFromServer(userId, role);
    const now = new Date();
    
    return appointments
      .filter(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        return aptDate >= now && apt.status !== 'cancelled';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
      });
  } catch (error) {
    console.error('Failed to fetch upcoming appointments:', error);
    return [];
  }
}

/**
 * Get past appointments from server
 */
async function getPastAppointmentsFromServer(userId, role) {
  try {
    const appointments = await getUserAppointmentsFromServer(userId, role);
    const now = new Date();
    
    return appointments
      .filter(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        return aptDate < now || apt.status === 'completed';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
      });
  } catch (error) {
    console.error('Failed to fetch past appointments:', error);
    return [];
  }
}

/**
 * Check for appointment conflicts
 */
async function checkAppointmentConflict(mentorId, date, time) {
  try {
    const appointments = await getAppointmentsFromServer();
    
    const conflict = appointments.find(apt => 
      apt.mentorId === mentorId &&
      apt.date === date &&
      apt.time === time &&
      apt.status !== 'cancelled'
    );
    
    return !!conflict;
  } catch (error) {
    console.error('Failed to check conflicts:', error);
    return false;
  }
}
