# Home Hub - Feature Testing Checklist

## Test Environment
- **URL:** https://home.spidmax.win
- **Test Date:** 2026-03-23
- **Browser:** Chrome/Firefox (user testing required)

---

## 🔐 Authentication & Security

### Login
- [ ] Navigate to https://home.spidmax.win
- [ ] Should redirect to /login
- [ ] Login with demo credentials: `demo@home.com` / `demo123`
- [ ] Should redirect to dashboard after successful login
- [ ] Invalid credentials should show error message
- [ ] Form validation should work (email format, password length)

### Session Management
- [ ] Session persists on page refresh
- [ ] Logout button works
- [ ] After logout, redirects to /login
- [ ] Protected routes redirect to /login when not authenticated

### Security Features
- [ ] Rate limiting: Try 100+ requests rapidly (should get 429 error)
- [ ] Input validation: Try submitting invalid data (should show validation errors)
- [ ] XSS protection: Try entering `<script>alert('xss')</script>` in forms (should be escaped)

---

## 🏠 Dashboard

### Stats Cards
- [ ] Device count displays correctly
- [ ] Online devices count shows
- [ ] Shopping items count accurate
- [ ] Pending chores count accurate
- [ ] Energy usage displays
- [ ] All cards have proper animations (slide-in with stagger)

### Quick Actions
- [ ] "Control Devices" link works
- [ ] "Shopping List" link works
- [ ] "Security Cameras" link works
- [ ] "Energy Usage" link works
- [ ] Hover effects work on action cards

### Recent Activity
- [ ] Shows last 4 devices
- [ ] Device names and rooms display
- [ ] Online/offline badges show correctly
- [ ] "See All" link works

### Weather Widget
- [ ] Current temperature displays
- [ ] Location shows (Nairobi, Kenya)
- [ ] Weather condition displays
- [ ] Humidity, wind, feels-like show correctly

---

## 💡 Devices Page

### Device List
- [ ] All devices display in grid
- [ ] Device icons show correctly (💡🔒🌡️🔌🚗💦)
- [ ] Online/offline status badges work
- [ ] Room names display

### Device Controls
- [ ] Toggle button works for online devices
- [ ] Toggle button disabled for offline devices
- [ ] Loading state shows during toggle ("Loading...")
- [ ] Optimistic update: UI updates immediately
- [ ] Error rollback: State reverts if API fails
- [ ] Success toast shows after toggle
- [ ] Light brightness slider works (if device is light)
- [ ] Thermostat temperature displays

### Accessibility
- [ ] Keyboard navigation works (Tab through devices)
- [ ] Focus states visible on buttons
- [ ] ARIA labels present on toggle buttons
- [ ] Screen reader announces device states

---

## 🛒 Household Page

### Shopping List
- [ ] Add new item works
- [ ] Item appears in list immediately
- [ ] Loading state on "Add" button
- [ ] Check/uncheck items works
- [ ] Optimistic update: checkbox updates immediately
- [ ] Error rollback: reverts if API fails
- [ ] Delete item shows confirmation dialog
- [ ] Delete shows undo toast (5 seconds)
- [ ] Undo button restores deleted item
- [ ] Empty state shows when no items (🛒 icon + message)

### Chores List
- [ ] Add new chore works
- [ ] Chore appears in list immediately
- [ ] Loading state on "Add" button
- [ ] Check/uncheck chores works
- [ ] Optimistic update: checkbox updates immediately
- [ ] Error rollback: reverts if API fails
- [ ] Delete chore shows confirmation dialog
- [ ] Delete shows undo toast (5 seconds)
- [ ] Undo button restores deleted chore
- [ ] Empty state shows when no chores (✅ icon + message)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus returns to input after adding item
- [ ] Focus moves to next item after delete
- [ ] ARIA labels on checkboxes
- [ ] ARIA labels on delete buttons (44x44px touch targets)
- [ ] Screen reader announces changes

---

## ⚡ Energy Page

### Charts
- [ ] Usage chart displays (area chart)
- [ ] Cost chart displays (bar chart)
- [ ] Charts load with SWR (loading spinner first)
- [ ] Data revalidates on focus
- [ ] Hover tooltips work on charts
- [ ] Charts are responsive

### Stats
- [ ] "This Month" total shows
- [ ] "Estimated Cost" calculates correctly
- [ ] "Daily Average" displays
- [ ] "Status" shows (Normal/High/Low)

### Energy Tips
- [ ] 3 tip cards display
- [ ] Icons show (💡🌡️🔌)
- [ ] Tips are readable and helpful

---

## ⚙️ Settings Page

### Profile Section
- [ ] User avatar displays (first letter of name)
- [ ] User name displays
- [ ] User email displays
- [ ] "Display Name" input works
- [ ] "Email" input is disabled
- [ ] "Save Changes" button works
- [ ] Loading state on save
- [ ] Success toast after save
- [ ] Error toast if save fails

### Family Members
- [ ] All users display
- [ ] User avatars show
- [ ] Role badges display (admin/member)
- [ ] "Add Family Member" button present

### Theme Toggle
- [ ] Dark mode button active by default
- [ ] Light mode button works
- [ ] Theme persists on page refresh (localStorage)
- [ ] All colors update when theme changes
- [ ] Smooth transition between themes

### Home Assistant Integration
- [ ] Form fields present (HA URL, Token)
- [ ] "Connect" button present
- [ ] Form is non-functional (placeholder)

---

## 🎨 UI/UX Features

### Navigation
- [ ] Sidebar shows all menu items
- [ ] Active page highlighted with primary color
- [ ] Hover states work on nav links
- [ ] Logo/title displays
- [ ] User menu shows (avatar + name)
- [ ] Logout button works

### Mobile Responsiveness
- [ ] Hamburger menu appears on mobile (<768px)
- [ ] Hamburger button toggles sidebar
- [ ] Backdrop overlay shows when sidebar open
- [ ] Clicking backdrop closes sidebar
- [ ] Clicking nav link closes sidebar
- [ ] Smooth slide-in animation
- [ ] All pages responsive on mobile

### Animations
- [ ] Page fade-in on load
- [ ] Stat cards slide-in with stagger
- [ ] Toast notifications fade-in
- [ ] Toast auto-dismiss after 5 seconds
- [ ] Hover effects on cards (subtle lift)
- [ ] Button ripple effects
- [ ] Smooth transitions (0.2s ease)

### Toast Notifications
- [ ] Success toasts (green)
- [ ] Error toasts (red)
- [ ] Info toasts (blue)
- [ ] Undo button on delete toasts
- [ ] Auto-dismiss after 5 seconds
- [ ] Multiple toasts stack properly
- [ ] ARIA live regions announce to screen readers

### Accessibility
- [ ] Skip link appears on Tab (top-left)
- [ ] Skip link jumps to main content
- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatible
- [ ] Touch targets 44x44px minimum

---

## 🔧 Technical Features

### Performance
- [ ] Initial page load < 3 seconds
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] SWR caching works (energy data)
- [ ] Images optimized (if any)
- [ ] Bundle size reasonable

### Error Handling
- [ ] API errors show user-friendly messages
- [ ] Network errors handled gracefully
- [ ] 404 page shows for invalid routes
- [ ] Error boundary catches React errors
- [ ] Console has no critical errors

### Data Persistence
- [ ] Changes persist on page refresh
- [ ] Theme preference saved to localStorage
- [ ] Session persists (JWT)
- [ ] Database updates work

---

## 🚨 Known Issues / Manual Steps Required

1. **NEXTAUTH_SECRET** - Still using default value, needs rotation:
   ```bash
   openssl rand -base64 32
   ```
   Update in Dokploy environment variables

2. **Demo Credentials** - Verify these work:
   - Email: `demo@home.com`
   - Password: `demo123`

---

## Test Results

**Tester:** _____________  
**Date:** _____________  
**Browser:** _____________  
**Device:** _____________  

**Overall Status:** ⬜ Pass ⬜ Fail ⬜ Needs Work

**Critical Issues Found:**
- 
- 

**Minor Issues Found:**
- 
- 

**Notes:**
