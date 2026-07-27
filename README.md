# 🏫 School Manager

> A role-based school management platform — admins run the school, teachers run their courses, and students run their schedule. Built with Angular 19, NgRx, and Firebase.

School Manager is a full-stack SPA for managing courses, enrollments, schedules, grades, and attendance across three distinct roles: **Admin**, **Teacher**, and **Student**. It ships with its own Express/Firestore API server and is designed with SSR, state management, and audit logging baked in from day one.

---

## ✨ Features

### 👑 Admin
- **User management** — create, update, and filter/search users by role (Admin / Teacher / Student).
- **Course management** — assign teachers, manage sessions, and handle student enrollment requests.
- **Scheduling** — approve pending schedules, set recurring sessions (weekly / biweekly / monthly) with room assignments.
- **Audit log viewer** — a searchable log of system activity (auth, navigation, course, grade, attendance, and admin actions), categorized via a dedicated `LogCategory` enum.

### 🧑‍🏫 Teacher
- Dedicated teacher dashboard for the courses they own.
- Manage sessions, track attendance, and record grades per student.

### 🎓 Student
- Personal dashboard with **course enrollment** requests.
- **Weekly schedule** view built from approved course sessions.

### 🛠 Platform-wide
- **Role-based route guards** (`roleGuard`, `AuthGuard`) — routes are locked down per role, with automatic redirects to `/unauthorized` or `/login`.
- **NgRx state management** — dedicated store slices for `auth`, `courses`, `users`, `assignments`, and `logs`, each with actions/effects/reducers/selectors.
- **Server-Side Rendering (SSR)** via Angular Universal (`@angular/ssr`).
- **AG Grid** data tables for course/user/session management.
- **Firebase** integration (`@angular/fire`) for auth and data.
- **Standalone Express API server** (`school-api-server/`) as a lightweight REST layer in front of Firestore, deployable independently (Vercel-ready).

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Angular 19 (standalone components, SSR-ready) |
| State management | NgRx (Store, Effects, Entity, Store DevTools) |
| Styling | Tailwind CSS |
| Data grid | AG Grid Community |
| Icons | Font Awesome |
| Backend (data) | Firebase / Firestore |
| Backend (API) | Express.js (`school-api-server/`) with a Firestore REST wrapper |
| Language | TypeScript |
| Testing | Karma + Jasmine |

## 🗂️ Project structure

```
src/app/
├── auth/                      # Login & register components
├── core/
│   ├── guards/                 # auth.guard.ts, role.guards.ts
│   ├── services/                # auth, course, user, assignment, db, logging, spinner
│   ├── navbar/ · notification/ · spinner/ · confirmation-dialog/
│   └── *.model.ts               # User, Course, Assignment, LogEntry, filters/search models
├── dashboard/
│   ├── admin-dash/               # user & course management, filters, log viewer
│   ├── teacher-dash/
│   └── student-dash/             # course enrollment, weekly schedule
├── state/                       # NgRx slices: auth, courses, users, assignments, logs
└── app.routes.ts                # Role-guarded routing table

school-api-server/               # Standalone Express API (Firestore REST client)
```

## 🚀 Getting started

### Prerequisites
- Node.js (see `school-api-server/.nvmrc` for the pinned version)
- Angular CLI (`npm install -g @angular/cli`)
- A Firebase project (Firestore + Auth enabled)

### 1. Frontend

```bash
git clone https://github.com/andreinicolaemartincalutiu/angular-school-mngr.git
cd angular-school-mngr
npm install
```

Configure `environment.ts` with your Firebase project config, then run:

```bash
npm start        # ng serve — http://localhost:4200
```

Build for production (with SSR):

```bash
npm run build
npm run serve:ssr:school-mngr
```

### 2. API server (optional standalone backend)

```bash
cd school-api-server
npm install
cp .env.example .env   # add FIREBASE_PROJECT_ID and any required credentials
npm run dev             # nodemon server.js
```

The API server exposes a lightweight REST layer over Firestore (`add`/`get`/`set` document helpers) and is deployable independently on Vercel (`vercel.json` included).

## 🔐 Roles & routing

| Route | Guard | Role |
|---|---|---|
| `/admin/dashboard`, `/admin/logs` | `roleGuard(['Admin'])` | Admin |
| `/teacher/dashboard` | `roleGuard(['Teacher'])` | Teacher |
| `/student/dashboard` | `roleGuard(['Student'])` | Student |
| `/login`, `/register`, `/home` | — | Public |
| `/unauthorized` | — | Redirect target for denied access |

## 🧪 Testing

```bash
npm test
```

Unit tests cover NgRx reducers (`assignments`, `courses`), the auth service, and key UI components (login, register, notification).

## 📄 License

Private / educational project. No license specified — contact the repository owner before reuse.
