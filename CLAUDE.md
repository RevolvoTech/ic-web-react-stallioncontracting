# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based website for Stallion Contracting, a roofing company. The project uses Vite as the build tool and is structured as a single-page application with component-based architecture.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture

### Tech Stack
- **React 19.1.0** with modern React patterns
- **Vite** for build tooling and development server
- **SCSS/Sass** for styling with component-specific stylesheets
- **ESLint** with React-specific rules and hooks validation

### Project Structure
- `src/App.jsx` - Main application component that renders all page sections
- `src/Components/` - All React components organized by feature:
  - Each component has its own directory with `.jsx` and `.scss` files
  - Components: Navbar, Header, Services, Projects, About, Gallery, Contact, Footer
- `src/assets/` - Static assets including images, videos, and logos
- `public/` - Public assets served directly

### Component Architecture
- Single-page application with smooth scrolling navigation
- Each section is a separate component imported into App.jsx
- Components use SCSS modules for styling
- Video background in Header component with overlay design
- Smooth scrolling functionality implemented in Header for navigation

### Key Implementation Details
- Uses `react-phone-input-2` for phone number input handling
- Video assets stored in `src/assets/Videos/`
- Logo and images in `src/assets/img/`
- Components follow consistent naming: PascalCase for files and directories
- SCSS files use component-specific class naming

### ESLint Configuration
- Custom rules including unused variables with pattern exceptions
- React hooks validation enabled
- React refresh plugin for development
- Ignores `dist` directory