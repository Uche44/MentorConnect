# Testing Appointment Flow

## How It Should Work:

### 1. Student Creates Appointment
- Student selects mentor and schedules session
- Appointment created with `status: 'pending'`
- Saved to JSON Server at `http://localhost:3000/appointments`

### 2. Mentor Sees Pending Request
- Mentor logs in to dashboard
- `loadMentorAppointments()` fetches all appointments for this mentor
- Filters appointments with `status === 'pending'`
- Displays in "Pending Requests" section

### 3. Mentor Confirms/Declines
- **Confirm**: Updates `status` to `'confirmed'`, moves to "Upcoming Sessions"
- **Decline**: Updates `status` to `'cancelled'`, removed from view

## Debugging Steps:

### Check if Appointment Was Created:
1. Open browser console (F12)
2. After creating appointment, check:
   ```javascript
   fetch('http://localhost:3000/appointments')
     .then(r => r.json())
     .then(console.log)
   ```
3. Look for your appointment with `status: 'pending'`

### Check Mentor Dashboard Loading:
1. Login as mentor
2. Open console (F12)
3. Check for errors in `loadMentorAppointments()`
4. Verify the mentor ID matches the appointment's `mentorId`

### Common Issues:

**Issue 1: Appointment not appearing**
- **Cause**: Mentor ID mismatch
- **Fix**: Check that `appointment.mentorId === currentUser.id`

**Issue 2: Buttons not working**
- **Cause**: Functions not globally accessible
- **Fix**: Already fixed with `window.handleConfirmAppointment = ...`

**Issue 3: User data not loading**
- **Cause**: User not in JSON Server
- **Fix**: Already fixed with localStorage fallback

## Manual Test:

### As Student:
1. Login as student
2. Click "Schedule Session" on a mentor
3. Fill form and submit
4. Check console for success message
5. Verify appointment appears in "Upcoming Appointments"

### As Mentor:
1. **Open different browser** (or incognito)
2. Login as the mentor you scheduled with
3. Check "Pending Requests" section
4. Should see the appointment with Confirm/Decline buttons
5. Click "Confirm"
6. Appointment should move to "Upcoming Sessions"

## API Endpoints:

- **All appointments**: `GET http://localhost:3000/appointments`
- **Specific appointment**: `GET http://localhost:3000/appointments/{id}`
- **Update appointment**: `PATCH http://localhost:3000/appointments/{id}`

## Expected Data Flow:

```
Student Dashboard
    ↓ (creates appointment)
JSON Server (/appointments)
    ↓ (status: 'pending')
Mentor Dashboard (Pending Requests)
    ↓ (mentor clicks Confirm)
JSON Server (update status: 'confirmed')
    ↓
Mentor Dashboard (Upcoming Sessions)
```

## Quick Fix if Not Working:

**Refresh both dashboards:**
```javascript
// In browser console
location.reload();
```

**Check JSON Server is running:**
- Terminal should show: `Watching...`
- Visit: http://localhost:3000/appointments

**Verify appointment data:**
```json
{
  "id": "...",
  "studentId": "...",
  "mentorId": "...",
  "status": "pending",  // ← Should be 'pending'
  "date": "2026-02-04",
  "time": "10:00",
  ...
}
```
