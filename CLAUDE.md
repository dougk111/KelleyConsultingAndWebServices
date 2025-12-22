# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 21 application for Kelley Consulting & Web Services. The project uses:
- Angular CLI for build tooling and scaffolding
- Vitest for unit testing
- Standalone components (no NgModules)
- Signal-based state management
- Strict TypeScript configuration

## Development Commands

### Development Server
```bash
npm start
# or
ng serve
```
Runs dev server at http://localhost:4200 with hot reload.

### Building
```bash
npm run build          # Production build (default)
ng build              # Same as above
npm run watch         # Development build with watch mode
ng build --configuration development
```

Production builds are output to `dist/` with optimizations and hashing enabled.

### Testing
```bash
npm test              # Run all tests with Vitest
ng test               # Same as above
```

The project uses Vitest as the test runner (not Karma/Jasmine).

### Code Generation
```bash
ng generate component component-name
ng generate service service-name
ng generate --help    # See all available schematics
```

## Architecture

### Application Bootstrap
- Entry point: `src/main.ts` - Bootstraps the standalone `App` component
- App config: `src/app/app.config.ts` - Provides router and global error listeners
- Routes: `src/app/app.routes.ts` - Central route configuration (currently empty)

### Component Structure
This project uses Angular's **standalone component** architecture (no NgModules). Components:
- Use `imports` array in the `@Component` decorator for dependencies
- Named with class name `App` (not `AppComponent`) following the new convention
- Use `.html` and `.css` file extensions (e.g., `app.html`, `app.css`)
- Root component selector: `app-root`
- Component prefix: `app` (configured in angular.json)

### State Management
The codebase uses Angular **signals** for reactive state (e.g., `signal()` in `App` component). When working with state:
- Prefer signals over traditional observables for component state
- Use `readonly` for signals that shouldn't be modified externally

### TypeScript Configuration
The project enforces strict TypeScript settings:
- `strict: true` - All strict checks enabled
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `strictTemplates: true` in Angular compiler options

Ensure all code adheres to these strict settings.

### Code Style
- **Indentation**: 2 spaces (enforced by .editorconfig)
- **Quotes**: Single quotes for TypeScript (enforced by .editorconfig and Prettier)
- **Print width**: 100 characters (Prettier)
- **HTML formatting**: Uses Angular parser in Prettier

### Build Budgets
Production builds enforce bundle size limits:
- Initial bundle: 500kB warning, 1MB error
- Component styles: 4kB warning, 8kB error

Be mindful of bundle size when adding dependencies or large components.
# Kelley Consulting & Web Services (Angular) - Claude Instructions

## Goals
Build a small marketing site for Kelley Consulting & Web Services that showcases 3 demo websites (portfolio-style).
The site should be professional, fast, and simple.

## Tech Constraints
- Angular (standalone components)
- Angular Router
- CSS (no Tailwind unless explicitly requested)
- Keep changes minimal and readable
- Prefer strongly-typed TS
- No unnecessary dependencies

## Content Structure (Pages)
- Home: short intro + 3 demo cards + CTA
- Services: list of offerings + process overview
- Demos: grid of 3 demos (each links to a demo detail page)
- About: brief bio + tech stack
- Contact: simple contact card + email link (no backend form)

## Demo Sites (3)
1) Small Business Brochure Site (marketing + contact)
2) Service Booking / Request Quote (front-end only, realistic UI)
3) Dashboard / Admin Portal (mock data + charts/tables, front-end only)

## Working Style
- Always show a plan before making changes
- Implement in small commits/steps
- After each step: summarize what changed and where
- Don’t invent credentials or external services
