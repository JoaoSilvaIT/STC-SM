# STC-SM — Smart Tool Cabinets · System Manager

A system for managing **smart tool cabinets** and the **mechanics' shifts** that use them.
It tracks tool inventory and cabinet state in real time, records shift activity, and raises
alerts for operational anomalies (late start, early ending, a cabinet left open for too long).

## Repository layout

```
code/
├── jvm/STC-SM-Backend/   Kotlin + Spring Boot backend (REST + WebSocket)
├── web/                  Back-office web app (React + Vite)
├── simulator/            Cabinet/tool hardware simulator (React + Vite)
└── mobile/               Mechanic mobile app (React Native + Expo)
```

### Backend modules (Gradle multi-module)

| Module    | Responsibility                                                 |
|-----------|----------------------------------------------------------------|
| `domain`  | Core entities (User, Shift, Cabinet, Tool, Alert, …)           |
| `repo`    | JPA repositories and persistence                               |
| `service` | Business logic and domain error handling                       |
| `http`    | REST controllers, WebSocket endpoints, request/response models |
| `app`     | Spring Boot entry point, configuration, data seeding           |

## Tech stack

- **Backend:** Kotlin 2.2, Spring Boot 4.0 (Web MVC, Data JPA, Security, WebSocket), PostgreSQL (H2 for tests)
- **Web & Simulator:** React 19, Vite, React Router, STOMP over WebSocket
- **Mobile:** React Native, Expo

## Quick start with Docker (recommended)

The whole stack — PostgreSQL, the backend, the web app and the simulator — runs
with a single command. The only prerequisite is Docker with the Compose plugin.

```bash
docker compose up --build
```

Then open:

| Service        | URL                       |
|----------------|---------------------------|
| Back-office    | http://localhost:8081     |
| Simulator      | http://localhost:8082     |
| Backend API    | http://localhost:8080     |
| PostgreSQL     | localhost:5432            |

Each front end is served by nginx, which reverse-proxies `/api` and
`/ws-simulator` to the backend, so everything is same-origin (no CORS setup
needed) and the database is created automatically.

To stop: `Ctrl-C`, or `docker compose down` (add `-v` to also wipe the database
volume). The mobile app (Expo) is not containerised — see *Running the frontends*.

### Configuration

All settings have working defaults. To change ports, the DB password, or the
Hibernate schema strategy, copy `.env.example` to `.env` and edit it:

```bash
cp .env.example .env
```

> If you change `WEB_PORT` / `SIM_PORT`, also update the matching
> `*_VITE_WS_URL` (it is baked into the bundle at build time) and rebuild that
> image with `docker compose build web simulator`.

## Prerequisites (running locally without Docker)

- JDK 21 (the Gradle toolchain resolver downloads one automatically if missing)
- Node.js 20+
- PostgreSQL 14+ (for running the backend; tests use an in-memory H2 database)

## Running the backend

1. Create `code/jvm/STC-SM-Backend/app/src/main/resources/application.properties`
   (it is git-ignored) with your database connection, e.g.:

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/stcsm
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   spring.jpa.hibernate.ddl-auto=update
   ```

2. From `code/jvm/STC-SM-Backend`, run:

   ```bash
   ./gradlew :app:bootRun
   ```

   The API is served on `http://localhost:8080`.

On a non-`prod` profile the app seeds demo profiles and users on first start
(see `DataInitializer`). These accounts use weak, well-known passwords and are
**for local development only** — they are excluded when the `prod` profile is active.

### Cross-origin configuration

REST CORS and the WebSocket endpoint default to `http://localhost:*` /
`http://127.0.0.1:*`, which covers local dev. Override for other environments via:

```properties
app.cors.allowed-origins=https://your-frontend.example.com
```

## Running the frontends

```bash
# Back-office web app
cd code/web && npm install && npm run dev

# Cabinet simulator
cd code/simulator && npm install && npm run dev

# Mechanic mobile app
cd code/mobile && npm install && npm start
```

The web and simulator apps expect the backend at `http://localhost:8080`
(override with the `VITE_API_BASE` environment variable).
