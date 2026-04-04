# ALZ ForeSight — Web App

A modern Alzheimer's disease care and AI prediction dashboard built with **React + Vite** (frontend) and **Express + MongoDB** (backend).

## Features

- **Patient Dashboard** — 3D brain model, health overview, appointment calendar
- **Doctor Dashboard** — Appointment management, patient list, statistics, calendar, messages
- **AI Diagnosis** (Doctor only) — XGBoost-based Alzheimer's risk prediction using ADNI clinical features
- **JWT Authentication** — Role-based login (patient / doctor) with in-memory fallback when MongoDB is unavailable

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- (Optional) **MongoDB Atlas** or local MongoDB instance

> The backend works **without MongoDB** by falling back to in-memory user storage and mock data — useful for quick demos.

---

## Quick Start

### 1. Install dependencies

```bash
# From the repository root:
cd web-app/backend && npm install
cd ../.. 
cd web-app && npm install
```

### 2. Configure environment

Create `web-app/backend/.env`:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=<your-mongodb-connection-string>   # optional
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

> **macOS note:** Port 5000 is used by AirPlay Receiver. The backend defaults to **5001**.

### 3. Start the backend

```bash
cd web-app/backend
node server.js
```

You should see:
```
🚀 Server is running on port 5001
```

### 4. Start the frontend

```bash
cd web-app
npm run dev
```

The app opens at **http://localhost:5173**.

### 5. Seed test accounts (if no MongoDB)

When running without MongoDB the in-memory store starts empty. Create test users with curl:

```bash
# Patient account
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"patient@test.com","password":"password123","role":"patient"}'

# Doctor account
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Smith","email":"doctor@test.com","password":"password123","role":"doctor"}'
```

### 6. Login

Open **http://localhost:5173** and log in with:

| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Patient | patient@test.com   | password123   |
| Doctor  | doctor@test.com    | password123   |

---

## Project Structure

```
web-app/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── inMemoryStore.js       # Shared in-memory user store (fallback)
│   ├── middleware/auth.js      # JWT auth middleware
│   ├── models/                 # Mongoose models (User, Appointment, …)
│   ├── routes/                 # API route handlers
│   │   ├── auth.js             # Register / Login
│   │   ├── appointments.js     # CRUD appointments
│   │   ├── doctors.js          # Doctor profiles & statistics
│   │   ├── patients.js         # Patient data
│   │   ├── predict.js          # AI prediction proxy
│   │   └── medicalRecords.js   # Medical records
│   └── .env                    # Environment config (not committed)
├── src/
│   ├── main.jsx               # Router setup
│   ├── App.jsx                # Patient dashboard
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── DoctorManagement.jsx # Doctor dashboard + AI Diagnosis
│   │   └── AIDiagnosis.jsx    # AI prediction form & results
│   ├── components/
│   │   └── BrainCanvas.jsx    # 3D brain model (Three.js)
│   └── services/
│       └── api.js             # Axios instance & API helpers
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Three.js, React Router |
| Backend  | Express.js, Mongoose, JWT, bcrypt   |
| AI Model | XGBoost (Python), served via predict route |
| Database | MongoDB Atlas (optional)            |
