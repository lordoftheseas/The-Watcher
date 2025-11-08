# Watcher Frontend

Real-time crime detection monitoring system frontend application.

## Features

- 🏠 Modern landing page with hero section and feature showcase
- 🔐 Login page with authentication
- 📝 Sign up page with form validation
- 🎨 Beautiful UI with gradient backgrounds and animations
- 📱 Fully responsive design
- ⚡ Built with React + Vite for fast development

## Tech Stack

- React 18
- React Router DOM for navigation
- Vite for build tooling
- CSS3 with modern features

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build
```

### Preview Production Build

```bash
# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx      # Landing page component
│   │   ├── Login.jsx        # Login page component
│   │   └── SignUp.jsx       # Sign up page component
│   ├── styles/
│   │   ├── Landing.css      # Landing page styles
│   │   └── Auth.css         # Authentication pages styles
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Pages

### Landing Page (`/`)
- Hero section with call-to-action buttons
- Real-time monitoring visualization
- Statistics display (Accuracy, Response Time, 24/7 Monitoring)
- Features grid showcasing key capabilities
- Call-to-action section
- Footer with links

### Login Page (`/login`)
- Email and password fields
- Remember me checkbox
- Forgot password link
- Social login options (Google, GitHub)
- Link to sign up page

### Sign Up Page (`/signup`)
- Full name, email, and password fields
- Password confirmation
- Terms and conditions checkbox
- Social sign up options (Google, GitHub)
- Link to login page

## TODO

- [ ] Connect to backend API for authentication
- [ ] Implement actual authentication logic
- [ ] Add form validation with error messages
- [ ] Implement password reset functionality
- [ ] Add OAuth integration for social logins
- [ ] Create dashboard page after successful login
- [ ] Add loading states and error handling
- [ ] Implement protected routes

## Notes

- All authentication forms are currently client-side only
- Backend integration is needed for actual authentication
- Social login buttons are UI-only at this stage
