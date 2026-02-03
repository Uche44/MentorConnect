/**
 * STORAGE UTILITIES
 * LocalStorage management for users and appointments
 */

// Storage keys
const STORAGE_KEYS = {
  USERS: 'smp_users',
  APPOINTMENTS: 'smp_appointments',
  CURRENT_USER: 'smp_current_user'
};

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize storage with seed data if empty
 */
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(getSeedUsers()));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
  }
}

/**
 * Get seed users (demo mentors)
 */
function getSeedUsers() {
  return [
    {
      id: generateId(),
      email: 'sarah.johnson@mentor.com',
      password: hashPassword('demo123'), // In real app, this would be properly hashed
      role: 'mentor',
      firstName: 'Sarah',
      lastName: 'Johnson',
      avatar: '',
      phone: '555-0101',
      bio: 'Licensed counselor specializing in mental health and wellness. 10+ years of experience helping students navigate stress and anxiety.',
      specialty: ['Mental Health', 'Stress Management'],
      availability: generateAvailability(),
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      email: 'michael.chen@mentor.com',
      password: hashPassword('demo123'),
      role: 'mentor',
      firstName: 'Michael',
      lastName: 'Chen',
      avatar: '',
      phone: '555-0102',
      bio: 'Career advisor with expertise in tech industry transitions. Former software engineer turned career coach.',
      specialty: ['Career Advice', 'Tech Industry'],
      availability: generateAvailability(),
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      email: 'dr.williams@mentor.com',
      password: hashPassword('demo123'),
      role: 'mentor',
      firstName: 'Emily',
      lastName: 'Williams',
      avatar: '',
      phone: '555-0103',
      bio: 'Academic advisor with Ph.D. in Education. Specializing in study strategies and academic planning.',
      specialty: ['Academic Advising', 'Study Skills'],
      availability: generateAvailability(),
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      email: 'james.rodriguez@mentor.com',
      password: hashPassword('demo123'),
      role: 'mentor',
      firstName: 'James',
      lastName: 'Rodriguez',
      avatar: '',
      phone: '555-0104',
      bio: 'Career counselor focusing on resume building, interview prep, and professional development.',
      specialty: ['Career Advice', 'Interview Prep'],
      availability: generateAvailability(),
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      email: 'lisa.patel@mentor.com',
      password: hashPassword('demo123'),
      role: 'mentor',
      firstName: 'Lisa',
      lastName: 'Patel',
      avatar: '',
      phone: '555-0105',
      bio: 'Mental health counselor specializing in student wellness, mindfulness, and work-life balance.',
      specialty: ['Mental Health', 'Mindfulness'],
      availability: generateAvailability(),
      createdAt: new Date().toISOString()
    }
  ];
}

/**
 * Generate sample availability for mentors
 */
function generateAvailability() {
  const slots = [];
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const daysAhead = 14;
  
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add random time slots
    const numSlots = Math.floor(Math.random() * 3) + 2;
    const selectedTimes = times.sort(() => 0.5 - Math.random()).slice(0, numSlots);
    
    selectedTimes.forEach(time => {
      slots.push({
        date: date.toISOString().split('T')[0],
        time: time,
        duration: 60
      });
    });
  }
  
  return slots;
}

// ========================================
// USER OPERATIONS
// ========================================

/**
 * Get all users
 */
function getAllUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

/**
 * Get user by ID
 */
function getUserById(userId) {
  const users = getAllUsers();
  return users.find(user => user.id === userId);
}

/**
 * Get user by email
 */
function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Get all mentors
 */
function getAllMentors() {
  const users = getAllUsers();
  return users.filter(user => user.role === 'mentor');
}

/**
 * Create new user
 */
function createUser(userData) {
  const users = getAllUsers();
  
  // Check if email already exists
  if (getUserByEmail(userData.email)) {
    throw new Error('Email already exists');
  }
  
  const newUser = {
    id: generateId(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return newUser;
}

/**
 * Update user
 */
function updateUser(userId, updates) {
  const users = getAllUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  users[index] = {
    ...users[index],
    ...updates,
    id: userId, // Prevent ID from being changed
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return users[index];
}

/**
 * Delete user
 */
function deleteUser(userId) {
  const users = getAllUsers();
  const filtered = users.filter(user => user.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
}

// ========================================
// APPOINTMENT OPERATIONS
// ========================================

/**
 * Get all appointments
 */
function getAllAppointments() {
  const appointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  return appointments ? JSON.parse(appointments) : [];
}

/**
 * Get appointment by ID
 */
function getAppointmentById(appointmentId) {
  const appointments = getAllAppointments();
  return appointments.find(apt => apt.id === appointmentId);
}

/**
 * Get appointments for a user (student or mentor)
 */
function getUserAppointments(userId, role) {
  const appointments = getAllAppointments();
  
  if (role === 'student') {
    return appointments.filter(apt => apt.studentId === userId);
  } else if (role === 'mentor') {
    return appointments.filter(apt => apt.mentorId === userId);
  }
  
  return [];
}

/**
 * Get upcoming appointments for a user
 */
function getUpcomingAppointments(userId, role) {
  const appointments = getUserAppointments(userId, role);
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
}

/**
 * Get past appointments for a user
 */
function getPastAppointments(userId, role) {
  const appointments = getUserAppointments(userId, role);
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
}

/**
 * Create new appointment
 */
function createAppointment(appointmentData) {
  const appointments = getAllAppointments();
  
  // Check for conflicts
  const conflict = appointments.find(apt => 
    apt.mentorId === appointmentData.mentorId &&
    apt.date === appointmentData.date &&
    apt.time === appointmentData.time &&
    apt.status !== 'cancelled'
  );
  
  if (conflict) {
    throw new Error('This time slot is already booked');
  }
  
  const newAppointment = {
    id: generateId(),
    ...appointmentData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  appointments.push(newAppointment);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  
  return newAppointment;
}

/**
 * Update appointment
 */
function updateAppointment(appointmentId, updates) {
  const appointments = getAllAppointments();
  const index = appointments.findIndex(apt => apt.id === appointmentId);
  
  if (index === -1) {
    throw new Error('Appointment not found');
  }
  
  appointments[index] = {
    ...appointments[index],
    ...updates,
    id: appointmentId,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  
  return appointments[index];
}

/**
 * Delete appointment
 */
function deleteAppointment(appointmentId) {
  const appointments = getAllAppointments();
  const filtered = appointments.filter(apt => apt.id !== appointmentId);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
}

/**
 * Cancel appointment
 */
function cancelAppointment(appointmentId) {
  return updateAppointment(appointmentId, { status: 'cancelled' });
}

/**
 * Confirm appointment (for mentors)
 */
function confirmAppointment(appointmentId) {
  return updateAppointment(appointmentId, { status: 'confirmed' });
}

/**
 * Complete appointment
 */
function completeAppointment(appointmentId) {
  return updateAppointment(appointmentId, { status: 'completed' });
}

// ========================================
// SESSION MANAGEMENT
// ========================================

/**
 * Get current logged-in user
 */
function getCurrentUser() {
  const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!currentUser) return null;
  
  const session = JSON.parse(currentUser);
  const user = getUserById(session.userId);
  
  return user ? { ...user, loginTime: session.loginTime } : null;
}

/**
 * Set current user session
 */
function setCurrentUser(userId, role) {
  const session = {
    userId,
    role,
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
}

/**
 * Clear current user session (logout)
 */
function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return getCurrentUser() !== null;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate unique ID
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Simple password hashing (NOT SECURE - for demo only)
 * In production, use proper server-side hashing
 */
function hashPassword(password) {
  // This is NOT secure - just for demo purposes
  // In a real app, passwords should be hashed server-side
  return btoa(password);
}

/**
 * Verify password
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Clear all data (for testing)
 */
function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  initializeStorage();
}

// Initialize storage on load
initializeStorage();
