/**
 * AUTHENTICATION LOGIC
 * Handle user registration, login, and session management
 */

// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if already authenticated
  requireGuest();

  // Setup tab switching
  setupAuthTabs();

  // Setup form handlers
  setupLoginForm();
  setupSignupForm();
});

// ========================================
// TAB SWITCHING
// ========================================

function setupAuthTabs() {
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const loginForm = document.getElementById("loginFormContainer");
  const signupForm = document.getElementById("signupFormContainer");

  if (loginTab) {
    loginTab.addEventListener("click", () => {
      loginTab.classList.add("active");
      signupTab.classList.remove("active");
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
    });
  }

  if (signupTab) {
    signupTab.addEventListener("click", () => {
      signupTab.classList.add("active");
      loginTab.classList.remove("active");
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    });
  }
}

// ========================================
// LOGIN
// ========================================

function setupLoginForm() {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
}

async function handleLogin() {
  // Get form values
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Clear previous errors
  clearFormErrors("loginForm");

  // Validate
  const errors = validateLoginForm(email, password);
  if (Object.keys(errors).length > 0) {
    displayFormErrors("loginForm", errors);
    return;
  }

  try {
    // First, try to find user in JSON Server
    let user = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users?email=${encodeURIComponent(email)}`,
      );
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          user = users[0];
          console.log("User found in JSON Server:", user.email);
        }
      }
    } catch (serverError) {
      console.warn(
        "JSON Server not available, checking localStorage:",
        serverError,
      );
    }

    // Fallback to localStorage if not found on server
    if (!user) {
      user = getUserByEmail(email);
      if (user) {
        console.log("User found in localStorage:", user.email);
      }
    }

    if (!user) {
      showToast("Invalid email or password", "error");
      return;
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      showToast("Invalid email or password", "error");
      return;
    }

    // Set session
    setCurrentUser(user.id, user.role);

    // Show success message
    showToast(`Welcome back, ${user.firstName}!`, "success");

    // Redirect to dashboard
    setTimeout(() => {
      redirectToDashboard(user.role);
    }, 500);
  } catch (error) {
    console.error("Login error:", error);
    showToast("An error occurred during login. Please try again.", "error");
  }
}

function validateLoginForm(email, password) {
  const errors = {};

  if (!isRequired(email)) {
    errors.loginEmail = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.loginEmail = "Please enter a valid email";
  }

  if (!isRequired(password)) {
    errors.loginPassword = "Password is required";
  }

  return errors;
}

// ========================================
// SIGNUP
// ========================================

function setupSignupForm() {
  const form = document.getElementById("signupForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSignup();
  });
}

async function handleSignup() {
  // Get form values
  const formData = {
    firstName: document.getElementById("signupFirstName").value.trim(),
    lastName: document.getElementById("signupLastName").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    phone: document.getElementById("signupPhone").value.trim(),
    password: document.getElementById("signupPassword").value,
    confirmPassword: document.getElementById("signupConfirmPassword").value,
    role: document.getElementById("signupRole").value,
    bio: document.getElementById("signupBio")?.value.trim() || "",
    specialty: [],
  };

  // Get specialty if mentor
  if (formData.role === "mentor") {
    const specialtyCheckboxes = document.querySelectorAll(
      'input[name="specialty"]:checked',
    );
    formData.specialty = Array.from(specialtyCheckboxes).map((cb) => cb.value);
  }

  // Clear previous errors
  clearFormErrors("signupForm");

  // Validate
  const errors = await validateSignupForm(formData);
  if (Object.keys(errors).length > 0) {
    displayFormErrors("signupForm", errors);
    return;
  }

  // Create user
  try {
    const newUser = createUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: hashPassword(formData.password),
      role: formData.role,
      bio: formData.bio,
      specialty: formData.specialty,
      avatar: "",
      availability: formData.role === "mentor" ? generateAvailability() : [],
    });

    // Sync to JSON Server (async, don't wait)
    syncUserToServer(newUser).catch((err) => {
      console.warn("User created locally but failed to sync to server:", err);
    });

    // Set session
    setCurrentUser(newUser.id, newUser.role);

    // Show success message
    showToast("Account created successfully!", "success");

    // Redirect to dashboard
    setTimeout(() => {
      redirectToDashboard(newUser.role);
    }, 500);
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function validateSignupForm(formData) {
  const errors = {};

  // First name
  if (!isRequired(formData.firstName)) {
    errors.signupFirstName = "First name is required";
  }

  // Last name
  if (!isRequired(formData.lastName)) {
    errors.signupLastName = "Last name is required";
  }

  // Email
  if (!isRequired(formData.email)) {
    errors.signupEmail = "Email is required";
  } else if (!isValidEmail(formData.email)) {
    errors.signupEmail = "Please enter a valid email";
  } else {
    // Check for duplicate email in JSON Server first
    let emailExists = false;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users?email=${encodeURIComponent(formData.email)}`,
      );
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          emailExists = true;
        }
      }
    } catch (serverError) {
      console.warn(
        "Could not check JSON Server, checking localStorage:",
        serverError,
      );
    }

    // Fallback to localStorage check
    if (!emailExists && getUserByEmail(formData.email)) {
      emailExists = true;
    }

    if (emailExists) {
      errors.signupEmail = "Email already exists";
    }
  }

  // Phone
  if (!isRequired(formData.phone)) {
    errors.signupPhone = "Phone number is required";
  } else if (!isValidPhone(formData.phone)) {
    errors.signupPhone = "Please enter a valid phone number";
  }

  // Password
  if (!isRequired(formData.password)) {
    errors.signupPassword = "Password is required";
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.signupPassword = passwordValidation.errors[0];
    }
  }

  // Confirm password
  if (!isRequired(formData.confirmPassword)) {
    errors.signupConfirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.signupConfirmPassword = "Passwords do not match";
  }

  // Role
  if (!isRequired(formData.role)) {
    errors.signupRole = "Please select a role";
  }

  // Specialty (for mentors)
  if (formData.role === "mentor" && formData.specialty.length === 0) {
    errors.specialty = "Please select at least one specialty";
  }

  return errors;
}

// ========================================
// ROLE SELECTION
// ========================================

// Show/hide specialty field based on role
document.addEventListener("DOMContentLoaded", () => {
  const roleSelect = document.getElementById("signupRole");
  const specialtyField = document.getElementById("specialtyField");

  if (roleSelect && specialtyField) {
    roleSelect.addEventListener("change", () => {
      if (roleSelect.value === "mentor") {
        specialtyField.classList.remove("hidden");
      } else {
        specialtyField.classList.add("hidden");
      }
    });
  }
});

// ========================================
// FORM ERROR HANDLING
// ========================================

function displayFormErrors(formId, errors) {
  Object.entries(errors).forEach(([fieldId, message]) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add("error");

      // Remove existing error message
      const existingError = field.parentElement.querySelector(".form-error");
      if (existingError) {
        existingError.remove();
      }

      // Add error message
      const errorElement = document.createElement("span");
      errorElement.className = "form-error";
      errorElement.textContent = message;
      field.parentElement.appendChild(errorElement);
    }
  });
}

function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Remove error classes
  form.querySelectorAll(".error").forEach((field) => {
    field.classList.remove("error");
  });

  // Remove error messages
  form.querySelectorAll(".form-error").forEach((error) => {
    error.remove();
  });
}

// Clear error on input
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".form-input, .form-select").forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("error");
      const errorElement = field.parentElement.querySelector(".form-error");
      if (errorElement) {
        errorElement.remove();
      }
    });
  });
});

// ========================================
// LOGOUT
// ========================================

function handleLogout() {
  clearCurrentUser();
  showToast("Logged out successfully", "success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}
