# Conduit RealWorld Example App

> **React / Vite + SWC / Express.js / Sequelize / PostgreSQL codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://realworld.io/) spec and API.**

This codebase was created to demonstrate a fully fledged fullstack application built with **React / Vite + SWC / Express.js / Sequelize / PostgreSQL** including CRUD operations, authentication, routing, pagination, and more. It was developed as an academic project for the Software Testing course at ITESO (Spring 2026), based on the open source template by [TonyMckes](https://github.com/TonyMckes/conduit-realworld-example-app).

**[Demo app](https://conduit-realworld-example-app.fly.dev/) | [Other RealWorld Example Apps](https://codebase.show/projects/realworld?category=fullstack)**

> For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

---

## Table of Contents

- [Description](#description)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Screenshots](#screenshots)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Description

Conduit is a social blogging platform where users can publish articles, follow other authors, leave comments, and mark articles as favorites. The application follows the RealWorld specification, which defines a shared REST API contract that makes frontends and backends interchangeable.

The project is structured as an NPM workspace monorepo containing both the frontend (React + Vite) and the backend (Express.js + Sequelize) under the same repository, with shared scripts and tooling at the root level.

---

## Prerequisites

Before running the project, make sure the following tools are installed on your machine:

- Text editor / IDE (e.g., VS Code)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/) `v18.11.0+`
- [NPM](https://www.npmjs.com/) (included with Node.js)
- [Docker](https://www.docker.com/get-started) `v20+` — recommended for running PostgreSQL in a container
- PostgreSQL `v15+` — required if not using Docker

---

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/ozcarclemente/ITESO-Pruebas-Software-Proyecto.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ITESO-Pruebas-Software-Proyecto
   ```

3. Install all project dependencies (root, frontend, and backend workspaces):

   ```bash
   npm install
   ```

---

## Configuration

1. Create a `.env` file inside the `backend/` directory. Use the provided example as a reference:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Fill in the required environment variables — typically the database connection details (name, user, password, host, and port).

3. *(Optional)* Update the Sequelize configuration parameters in [`backend/config/config.js`](./backend/config/config.js).

4. If you are **not** using PostgreSQL, install the appropriate database driver:

   > **Note:** The `-w backend` flag installs the package into the backend `package.json`.

   ```bash
   npm install -w backend pg pg-hstore  # PostgreSQL (already installed)
   npm install -w backend mysql2        # MySQL
   npm install -w backend mariadb       # MariaDB
   npm install -w backend sqlite3       # SQLite
   npm install -w backend tedious       # Microsoft SQL Server
   npm install -w backend oracledb      # Oracle Database
   ```

   > Visit [Sequelize — Installing](https://sequelize.org/docs/v6/getting-started/#installing) for more information.

---

## Running the Application

### 1. Start the database

**Option A — Docker (recommended)**

The repository includes a `docker-compose.yaml` file that spins up a PostgreSQL 15 container with the required configuration:

```bash
docker compose up -d
```

This creates a container with user `postgres`, password `postgres`, and database `database_development` on port `5432`.

**Option B — Local PostgreSQL**

Make sure PostgreSQL is running and that the credentials in `backend/.env` match your local server configuration.

### 2. Create the database and run migrations

```bash
npm run sqlz -- db:create
```

> `npm run sqlz` is an alias for `npx -w backend sequelize-cli`. Run `npm run sqlz -- --help` to see all available commands.

*(Optional)* Seed the database with sample data:

```bash
npm run sqlz -- db:seed:all
```

### 3. Start the development server

```bash
npm run dev
```

Once running, the application is available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |

### Production build

To build the frontend and start the production server:

```bash
npm run start
```

---

## Running Tests

```bash
npm run test
```

This runs the full test suite using [Vitest](https://vitest.dev/).

---

## Project Structure

```
ITESO-Pruebas-Software-Proyecto/
├── backend/                    # REST API server
│   ├── config/                 # Sequelize database configuration
│   ├── migrations/             # Database migrations
│   ├── models/                 # Sequelize data models
│   ├── routes/                 # API route definitions
│   ├── seeders/                # Sample data seeders
│   ├── .env.example            # Environment variables template
│   └── package.json            # Backend dependencies
├── frontend/                   # React user interface
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Main application views
│   │   └── services/           # API communication logic
│   ├── index.html              # HTML entry point
│   └── package.json            # Frontend dependencies
├── .gitignore
├── CODE_OF_CONDUCT.md
├── docker-compose.yaml         # PostgreSQL container configuration
├── LICENSE
├── package.json                # Root workspace scripts and dev dependencies
└── vitest.config.js            # Test framework configuration
```

---

## Contributing

### Workflow

1. Make sure you are on an updated `main` branch before starting:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Create a new branch for each feature or fix, using a descriptive name:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes with clear, descriptive messages:

   ```bash
   git commit -m "feat: short description of the change"
   ```

4. Push your branch to the remote repository:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request on GitHub from your branch into `main` and request a review.

### Guidelines

- Do not commit directly to `main`.
- Each Pull Request should correspond to a single feature or fix.
- Make sure all tests pass (`npm run test`) before opening a Pull Request.
- Refer to [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for team conduct guidelines.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

- [TonyMckes — conduit-realworld-example-app](https://github.com/TonyMckes/conduit-realworld-example-app) — original template this project is based on
- [RealWorld](https://realworld.io/)
- [RealWorld (GitHub)](https://github.com/gothinkster/realworld)
- [CodebaseShow](https://codebase.show/projects/realworld?category=fullstack)