# TODO: Add Google Button and Build Backend for Custom Login

## Frontend Changes
- [x] Modify popup.html: Add "Continue with Google" button and "Login by Website" button
- [x] Add login form (username/password) in popup.html for website login
- [x] Update popup.js: Handle two login buttons - Google OAuth for Google button, show form for website button
- [x] Update popup.js: Add logic to send login credentials to backend API for website login (mocked for now)

## Backend Creation
- [ ] Create backend/ directory
- [ ] Create package.json for Node.js/Express backend
- [ ] Create server.js with Express server, routes for /register, /login
- [ ] Implement user authentication with JWT tokens
- [ ] Add middleware for token verification
- [ ] Test backend endpoints locally

## Integration and Testing
- [ ] Update extension to call backend API for custom login
- [ ] Handle JWT token storage in extension
- [ ] Update logout to handle both auth types
- [ ] Test both Google and custom login flows
- [ ] Ensure UI switches correctly between login methods
