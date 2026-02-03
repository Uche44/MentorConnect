# Student-Mentor Portal

A comprehensive web portal connecting students with mentors, academic advisors, and counselors for mental health and career guidance. Built with vanilla HTML, CSS, and JavaScript using localStorage as the database.

## 🌟 Features

### For Students
- **Browse Mentors**: Search and filter mentors by specialty and expertise
- **Schedule Sessions**: Book appointments with available mentors
- **Manage Appointments**: View upcoming and past sessions
- **Dashboard Overview**: Track your mentorship journey with stats

### For Mentors
- **Manage Appointments**: Review pending requests, confirm or decline sessions
- **Availability Management**: Set and update your available time slots
- **Profile Management**: Edit your bio and areas of expertise
- **Student Tracking**: See all students you've mentored

### General Features
- **Authentication System**: Secure login and signup with role-based access
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Beautiful UI**: Professional design inspired by modern wellness platforms
- **Real-time Updates**: Instant feedback with toast notifications

## 🎨 Design

The application features a calming, professional design with:
- **Color Palette**: Sage green (#8B9A7E), warm beige backgrounds, and earthy tones
- **Typography**: Playfair Display for headings, Inter for body text
- **Components**: Modern cards, modals, forms, and interactive elements
- **Responsive**: Mobile-first approach with breakpoints for all devices

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server or build tools required!

### Installation

1. **Clone or download** this repository to your local machine

2. **Open the application**:
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     ```

3. **Access the application**:
   - If using a local server: `http://localhost:8000`
   - Or just double-click `index.html`

## 📖 Usage Guide

### First Time Setup

1. **Visit the landing page** (`index.html`)
2. **Click "Get Started"** to go to the authentication page
3. **Sign up** as either a Student or Mentor

### Demo Accounts

The application comes with pre-loaded mentor accounts for testing:

**Mentor Accounts** (Password: `demo123` for all):
- sarah.johnson@mentor.com - Mental Health & Stress Management
- michael.chen@mentor.com - Career Advice & Tech Industry
- dr.williams@mentor.com - Academic Advising & Study Skills
- james.rodriguez@mentor.com - Career Advice & Interview Prep
- lisa.patel@mentor.com - Mental Health & Mindfulness

### As a Student

1. **Browse Mentors**: Use search and filters to find the right mentor
2. **Schedule a Session**:
   - Click "Schedule Session" on a mentor card
   - Select a date from the calendar
   - Choose an available time slot
   - Select session type and add notes
   - Submit the request
3. **Manage Appointments**: View and cancel appointments from your dashboard

### As a Mentor

1. **Review Requests**: Check pending appointment requests
2. **Confirm/Decline**: Respond to student requests
3. **Manage Profile**: Update your bio and specialties
4. **Set Availability**: Manage your available time slots

## 📁 Project Structure

```
charles/
├── index.html                 # Landing page
├── auth.html                  # Login/Signup page
├── student-dashboard.html     # Student dashboard
├── mentor-dashboard.html      # Mentor dashboard
├── styles/
│   ├── main.css              # Core styles and design tokens
│   ├── components.css        # Reusable UI components
│   └── dashboard.css         # Dashboard-specific styles
├── js/
│   ├── storage.js            # localStorage management
│   ├── utils.js              # Utility functions
│   ├── auth.js               # Authentication logic
│   ├── scheduler.js          # Scheduling functionality
│   ├── student-dashboard.js  # Student dashboard logic
│   └── mentor-dashboard.js   # Mentor dashboard logic
└── assets/
    ├── images/               # Image assets
    └── fonts/                # Custom fonts (if any)
```

## 🔒 Security Notes

⚠️ **Important**: This application uses localStorage and client-side password hashing for demonstration purposes only.

**NOT suitable for production use** because:
- Passwords are hashed client-side (not secure)
- No server-side validation
- Data stored in browser can be cleared
- No encryption for sensitive data

For production, you should:
- Implement proper server-side authentication
- Use a real database (PostgreSQL, MongoDB, etc.)
- Hash passwords server-side with bcrypt or similar
- Add HTTPS and proper session management
- Implement CSRF protection

## 💾 Data Storage

All data is stored in the browser's localStorage:
- **Users**: Student and mentor profiles
- **Appointments**: All scheduled sessions
- **Session**: Current logged-in user

**Note**: Clearing browser data will delete all information.

## 🎯 Key Features Explained

### Authentication Guards
- Unauthenticated users cannot access dashboards
- Role-based redirects (students → student dashboard, mentors → mentor dashboard)
- Automatic logout on session expiry

### Appointment Workflow
1. Student schedules → Status: **Pending**
2. Mentor confirms → Status: **Confirmed**
3. After session time → Status: **Completed**
4. Either party cancels → Status: **Cancelled**

### Availability System
- Mentors have pre-generated availability (14 days ahead)
- Weekdays only (Monday-Friday)
- Multiple time slots per day
- Automatic conflict detection

## 🛠️ Customization

### Change Colors
Edit `styles/main.css` and modify the CSS custom properties:
```css
:root {
  --color-primary: #8B9A7E;  /* Change primary color */
  --color-accent: #9B8B7E;   /* Change accent color */
  /* ... more variables */
}
```

### Add Specialties
Update the specialty options in:
- `auth.html` (signup form)
- `student-dashboard.html` (filter dropdown)
- `mentor-dashboard.html` (edit profile modal)

### Modify Seed Data
Edit `js/storage.js` → `getSeedUsers()` function to change demo mentors

## 🐛 Troubleshooting

**Problem**: Dashboard not loading
- **Solution**: Check browser console for errors, ensure all JS files are loaded

**Problem**: Can't schedule appointments
- **Solution**: Make sure you're logged in as a student, not a mentor

**Problem**: Lost all data
- **Solution**: Data is in localStorage - clearing browser data removes it

**Problem**: Mentor has no availability
- **Solution**: Click "Regenerate Availability" in the mentor dashboard

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your own purposes!

## 📧 Support

For questions or issues, please check the code comments or create an issue in the repository.

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**
