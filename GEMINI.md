# Conduit RealWorld Example App

## Project Overview
This codebase is a fully-fledged fullstack application (Conduit, a social blogging platform) that adheres to the RealWorld specification and API. It includes features like CRUD operations, authentication, routing, and pagination.

**Architecture & Technologies:**
- **Monorepo:** Structured as an NPM workspace containing both frontend and backend projects.
- **Frontend:** Built with React, utilizing Vite + SWC for fast development (`frontend/` directory).
- **Backend:** Built with Node.js and Express.js, using Sequelize ORM (`backend/` directory).
- **Database:** PostgreSQL (with a provided `docker-compose.yaml` for easy local setup).

## Building and Running
The project uses standard NPM scripts, with optional support for `just` commands.

- **Install dependencies:**
  ```bash
  npm install
  ```

- **Database Setup & Seeding:**
  Starts the PostgreSQL Docker container, creates the database, runs migrations, and seeds initial data.
  ```bash
  npm run setup
  # Or using just: just setup
  ```

- **Start Development Servers (Concurrent):**
  Runs both the Vite frontend and Express backend in watch mode.
  ```bash
  npm run dev
  # Or using just: just dev
  ```
  - Frontend URL: `http://localhost:3000`
  - Backend API: `http://localhost:3001/api`

- **Build and Start (Production):**
  Builds the React app and starts the Node server.
  ```bash
  npm run start
  ```

## Development Conventions
- **Testing:**
  - **Unit/Integration Tests (Jest):** `npm run test` (runs across both frontend and backend).
  - **System Tests (Cucumber):** `npm run test:system` (found in `tests/system/`).
  - **All Tests:** `npm run test:all`.
- **Code Quality:**
  - Formatting is handled by Prettier (`npm run format`).
  - Linting is handled by ESLint (`npm run lint`).
- **Git Workflow:**
  - Use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`). Husky and commitlint are configured to enforce this format.
  - Development is done on feature branches (e.g., `feature/your-feature`) and merged into `main` via Pull Requests.
