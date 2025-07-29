# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based website for Stallion Contracting, a roofing company. The project name is "zenith-homes" but represents Stallion Contracting's web presence. Built as a single-page application with component-based architecture using modern React patterns.

## Development Commands

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build for production using Vite
- `npm run lint` - Run ESLint to check code quality and React patterns
- `npm run preview` - Preview production build locally

## Architecture

### Tech Stack
- **React 19.1.0** with modern React patterns and JSX
- **Vite 6.3.5** for build tooling, development server, and fast HMR
- **SCSS/Sass** for styling with component-specific stylesheets
- **ESLint** with React hooks validation and refresh plugins
- **react-phone-input-2** for international phone number input
- **classnames** utility for conditional CSS classes

### Application Structure
- **Single-page application** with all sections rendered in `App.jsx`
- **Component-based architecture** with each section as a separate component
- **Sequential layout** - components are rendered top-to-bottom in App.jsx
- **SCSS styling** - each component has its own `.scss` file for styles

### Component Organization
```
src/Components/
├── Navigation/Navbar.jsx + Navbar.scss
├── Header/Header.jsx + Header.scss (video background)
├── Services/Services.jsx + Services.scss
├── Projects/Projects.jsx + Projects.scss
├── About/About.jsx + About.scss
├── Gallery/Gallery.jsx + Gallery.scss
├── Testimonials/Testimonials.jsx + Testimonials.scss (currently commented out)
├── Contact/Contact.jsx + Contact.scss (uses react-phone-input-2)
└── Footer/Footer.jsx + Footer.scss
```

### Assets Organization
- `src/assets/Videos/` - Video files for backgrounds
- `src/assets/img/` - Images including before/after photos and additional videos
- Logo files at `src/assets/` root level (logo.png, logo-horse.png)

### Key Implementation Details
- **Video backgrounds** implemented in Header component
- **Before/after image galleries** with numbered naming pattern
- **Phone input handling** via react-phone-input-2 in Contact component
- **Component naming** follows PascalCase for both files and directories
- **No routing** - all content on single page with smooth scrolling navigation

### ESLint Configuration
- Uses modern flat config format (`eslint.config.js`)
- React hooks rules enabled via `eslint-plugin-react-hooks`
- React refresh plugin for development HMR
- Custom rule: `no-unused-vars` with pattern exception for uppercase constants
- Ignores `dist` directory from linting