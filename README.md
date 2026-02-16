# Anonymous Thinker Frontend

A modern, responsive React application for the Anonymous Thinker platform - empowering users to share thoughts and ideas anonymously with a beautiful, intuitive interface.

## 🚀 Overview

Anonymous Thinker Frontend is a sleek, user-friendly web application built with React that provides an elegant interface for anonymous thought-sharing. The app features a clean design, smooth animations, and seamless integration with the Anonymous Thinker backend API.

## ✨ Features

- **🎨 Modern UI/UX** - Clean, intuitive interface with smooth animations
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🔐 Secure Authentication** - JWT-based login and registration
- **✍️ Anonymous Posting** - Share thoughts without revealing identity
- **📖 Feed Interface** - Browse and interact with anonymous posts
- **⚡ Real-time Updates** - Dynamic content loading and updates
- **🌙 Dark/Light Mode** - Theme switching for user preference
- **🔍 Search & Filter** - Find specific thoughts and topics
- **💬 Engagement Features** - Like, comment, and share anonymous thoughts
- **♿ Accessibility** - WCAG compliant for inclusive experience

## 📁 Project Structure

```
AnoymousThinker-Frontend/
├── public/                  # Static assets
│   ├── index.html          # HTML template
│   ├── favicon.ico         # App icon
│   └── manifest.json       # PWA manifest
├── src/                     # Source files
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles and themes
│   ├── assets/             # Images, fonts, icons
│   ├── App.js              # Root component
│   ├── App.css             # Root styles
│   ├── index.js            # Application entry point
│   └── index.css           # Global CSS
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── package-lock.json       # Locked dependency versions
└── README.md               # This file
```

## 🛠️ Tech Stack

### Core
- **React** - UI library for building user interfaces
- **React Router** - Client-side routing
- **JavaScript (ES6+)** - Modern JavaScript features

### State Management
- **React Context API** - Global state management
- **React Hooks** - useState, useEffect, useContext, custom hooks

### Styling
- **CSS3** - Modern styling with Flexbox and Grid
- **CSS Modules** - Scoped component styling
- **Responsive Design** - Mobile-first approach

### HTTP Client
- **Axios** - Promise-based HTTP client for API calls
- **Fetch API** - Native browser API for requests

### Development Tools
- **Create React App** - React application scaffolding
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher) or **yarn**
- **Git** for version control
- Running instance of [Anonymous Thinker Backend](https://github.com/SENODROOM/AnoymousThinker-Backend)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/SENODROOM/AnoymousThinker-Frontend.git
cd AnoymousThinker-Frontend
```

### 2. Install dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# App Configuration
REACT_APP_NAME=Anonymous Thinker
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DARK_MODE=true

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 4. Start the development server

Using npm:
```bash
npm start
```

Or using yarn:
```bash
yarn start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 🚀 Available Scripts

### Development

```bash
npm start          # Start development server
npm run dev        # Alternative development command
```

### Building

```bash
npm run build      # Create production build
npm run build:analyze  # Build with bundle analysis
```

### Testing

```bash
npm test           # Run test suite
npm run test:coverage  # Run tests with coverage report
npm run test:watch     # Run tests in watch mode
```

### Code Quality

```bash
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm run format     # Format code with Prettier
```

### Deployment

```bash
npm run deploy     # Deploy to production
npm run serve      # Serve production build locally
```

## 🎯 Key Components

### Core Components

**Authentication**
- `Login.js` - User login interface
- `Register.js` - User registration form
- `PrivateRoute.js` - Protected route wrapper

**Post Management**
- `PostCard.js` - Individual post display
- `PostFeed.js` - List of posts
- `CreatePost.js` - New post creation form
- `PostDetail.js` - Detailed post view

**Layout**
- `Header.js` - Navigation header
- `Footer.js` - Application footer
- `Sidebar.js` - Side navigation
- `Layout.js` - Main layout wrapper

**UI Elements**
- `Button.js` - Reusable button component
- `Input.js` - Form input component
- `Modal.js` - Modal dialog
- `Loader.js` - Loading spinner
- `Alert.js` - Notification alerts

## 🔌 API Integration

### API Service Structure

```javascript
// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### Example API Calls

```javascript
// Get all posts
export const getPosts = async () => {
  const response = await API.get('/posts');
  return response.data;
};

// Create new post
export const createPost = async (postData) => {
  const response = await API.post('/posts', postData);
  return response.data;
};

// User login
export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};
```

## 🎨 Styling Guide

### CSS Organization

```css
/* Global Variables */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --error-color: #f56565;
  --warning-color: #ed8936;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --background: #ffffff;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

## 🔒 Authentication Flow

1. **User Registration**
   - Fill registration form
   - Submit to `/api/auth/register`
   - Receive JWT token
   - Store token in localStorage
   - Redirect to dashboard

2. **User Login**
   - Enter credentials
   - Submit to `/api/auth/login`
   - Receive JWT token
   - Store token and user data
   - Redirect to home

3. **Protected Routes**
   - Check for valid token
   - Redirect to login if unauthorized
   - Allow access if authenticated

4. **Logout**
   - Clear localStorage
   - Reset application state
   - Redirect to login

## 📱 Progressive Web App (PWA)

The application is configured as a PWA with:

- **Offline Support** - Service worker caching
- **Install Prompt** - Add to home screen
- **App Manifest** - PWA configuration
- **Fast Loading** - Optimized assets

## 🧪 Testing

### Test Structure

```javascript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from './PostCard';

describe('PostCard Component', () => {
  test('renders post content', () => {
    const post = { id: 1, content: 'Test post' };
    render(<PostCard post={post} />);
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });
});
```

## 🎯 State Management

### Context API Example

```javascript
// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Deployment Platforms

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### GitHub Pages
```bash
npm install gh-pages --save-dev
npm run deploy
```

#### AWS S3 + CloudFront
1. Build the application
2. Upload `build/` folder to S3
3. Configure CloudFront distribution
4. Set up custom domain

### Environment-Specific Builds

```bash
# Production
REACT_APP_ENV=production npm run build

# Staging
REACT_APP_ENV=staging npm run build

# Development
REACT_APP_ENV=development npm run build
```

## 🔧 Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx}",
    "lint:fix": "eslint src/**/*.{js,jsx} --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,json,css,md}\"",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```

## 📊 Performance Optimization

- **Code Splitting** - React.lazy() and Suspense
- **Image Optimization** - WebP format, lazy loading
- **Bundle Analysis** - webpack-bundle-analyzer
- **Memoization** - React.memo, useMemo, useCallback
- **Virtual Scrolling** - For large lists
- **Service Workers** - Offline caching strategy

### Performance Checklist

- [ ] Minimize bundle size
- [ ] Implement lazy loading
- [ ] Optimize images
- [ ] Use CDN for static assets
- [ ] Enable gzip compression
- [ ] Implement caching strategies
- [ ] Monitor Core Web Vitals

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome Android (last 2 versions)

## ♿ Accessibility

The application follows WCAG 2.1 Level AA standards:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

### Pull Request Process

1. Update README with changes
2. Update version numbers
3. Ensure CI/CD passes
4. Get approval from maintainers
5. Squash commits before merge

## 🐛 Known Issues

- [ ] Loading spinner alignment on mobile
- [ ] Dark mode toggle persistence
- [ ] Safari date picker styling

## 🔮 Roadmap

- [ ] **v1.1** - Dark mode implementation
- [ ] **v1.2** - Push notifications
- [ ] **v1.3** - Advanced search filters
- [ ] **v1.4** - User profiles
- [ ] **v1.5** - Real-time chat
- [ ] **v2.0** - Mobile app (React Native)
- [ ] **v2.1** - AI-powered content suggestions
- [ ] **v2.2** - Internationalization (i18n)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **SENODROOM** - *Initial work* - [@SENODROOM](https://github.com/SENODROOM)

## 🙏 Acknowledgments

- React team for the amazing library
- Create React App for quick setup
- Open source community for inspiration
- All contributors who help improve this project

## 📞 Support

- **Email**: support@anonymousthinker.com
- **Issues**: [GitHub Issues](https://github.com/SENODROOM/AnoymousThinker-Frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SENODROOM/AnoymousThinker-Frontend/discussions)

## 🔗 Related Projects

- [Anonymous Thinker Backend](https://github.com/SENODROOM/AnoymousThinker-Backend) - Backend API
- [Anonymous Thinker Mobile](https://github.com/SENODROOM/AnoymousThinker-Mobile) - Mobile app (Coming soon)

## 📈 Analytics & Monitoring

- Google Analytics for user behavior
- Sentry for error tracking
- Lighthouse for performance audits
- Web Vitals monitoring

---

**Made with ❤️ and React by SENODROOM**

For more information, visit the [project homepage](https://github.com/SENODROOM/AnoymousThinker-Frontend)

⭐ **Star this repo if you find it helpful!** ⭐
