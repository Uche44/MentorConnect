# JSON Server Setup Guide

## What is JSON Server?

JSON Server is a simple backend that creates a REST API from a JSON file. It allows multiple browsers to share the same data, solving the localStorage isolation problem.

## Installation & Setup

### 1. Install Dependencies

```bash
cd C:\Users\HP\Desktop\Code\charles
npm install
```

This will install `json-server` from the `package.json` file.

### 2. Start JSON Server

```bash
npm run server
```

Or directly:
```bash
json-server --watch db.json --port 3000
```

You should see:
```
\{^_^}/ hi!

Loading db.json
Done

Resources
http://localhost:3000/users
http://localhost:3000/appointments

Home
http://localhost:3000
```

**IMPORTANT**: Keep this terminal window open! JSON Server must be running for the app to work.

### 3. Open the Application

In a **separate** terminal or just open in your browser:
```
C:\Users\HP\Desktop\Code\charles\index.html
```

Or use a local server (recommended):
```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js
npx http-server -p 8080
```

Then visit: `http://localhost:8080`

## How It Works

### Architecture

```
Browser A (Chrome) ──┐
                     ├──> JSON Server (localhost:3000) ──> db.json file
Browser B (Firefox) ─┘
```

### Data Flow

1. **Signup** (Mentor or Student):
   - Saves to **localStorage** (for login)
   - Syncs to **JSON Server** (for sharing)

2. **Login**:
   - Reads from **localStorage only**
   - Fast and works offline

3. **Browse Mentors**:
   - Fetches from **JSON Server**
   - All browsers see the same mentors

4. **Schedule Appointment**:
   - Saves to **JSON Server**
   - Both student and mentor see it

5. **Confirm/Decline Appointment**:
   - Updates **JSON Server**
   - Changes visible to both parties

## Testing Across Browsers

### Scenario 1: Mentor Signup
1. Open **Chrome**
2. Go to `auth.html`
3. Sign up as a mentor (e.g., `john@mentor.com`)
4. Logout

### Scenario 2: Student Sees Mentor
1. Open **Firefox**
2. Go to `auth.html`
3. Sign up as a student (e.g., `jane@student.com`)
4. Go to student dashboard
5. **You should see John in the mentors list!** ✅

### Scenario 3: Book Appointment
1. In Firefox (as student), click "Schedule Session" with John
2. Select date and time
3. Submit

### Scenario 4: Mentor Sees Request
1. Switch to **Chrome**
2. Login as John (mentor)
3. **You should see Jane's appointment request!** ✅
4. Click "Confirm"

### Scenario 5: Student Sees Confirmation
1. Switch to **Firefox**
2. Refresh the student dashboard
3. **Appointment status should be "Confirmed"!** ✅

## API Endpoints

JSON Server automatically creates these endpoints:

### Users
- `GET /users` - Get all users
- `GET /users?role=mentor` - Get all mentors
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Appointments
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get appointment by ID
- `POST /appointments` - Create appointment
- `PATCH /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

## Troubleshooting

### Problem: "Failed to fetch"
**Solution**: Make sure JSON Server is running (`npm run server`)

### Problem: "Port 3000 already in use"
**Solution**: 
```bash
# Use a different port
json-server --watch db.json --port 3001
```
Then update `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

### Problem: "Can't see new mentors"
**Solution**: 
1. Check JSON Server terminal - should show POST request
2. Check browser console for errors
3. Verify JSON Server is running
4. Try refreshing the page

### Problem: "CORS error"
**Solution**: JSON Server has CORS enabled by default, but if you see errors:
```bash
json-server --watch db.json --port 3000 --middlewares ./cors.js
```

### Problem: Lost all data
**Solution**: Check `db.json` file - your data is there. If corrupted, restore from backup or restart with seed data.

## Data Persistence

- **localStorage**: User accounts (for login)
- **db.json**: All appointments + synced users
- **Backup**: Copy `db.json` to save your data

## Stopping JSON Server

Press `Ctrl + C` in the terminal where JSON Server is running.

## Production Deployment

JSON Server is **NOT for production**. For a real app, use:
- **Backend**: Node.js + Express, Python + FastAPI, etc.
- **Database**: PostgreSQL, MongoDB, MySQL
- **Hosting**: Vercel, Railway, Heroku, AWS

## Summary

✅ **Signups** → localStorage + JSON Server
✅ **Login** → localStorage only
✅ **Mentors** → JSON Server (shared across browsers)
✅ **Appointments** → JSON Server (shared across browsers)
✅ **Cross-browser** → Works perfectly!

**Remember**: Keep JSON Server running in a terminal window while using the app!
