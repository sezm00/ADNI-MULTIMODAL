# ALZ ForeSight - Full Stack Setup Guide

## Prerequisites
- Node.js installed
- MongoDB installed

## Backend Setup

### 1. Install MongoDB
If you don't have MongoDB installed:
- Download from: https://www.mongodb.com/try/download/community
- Or install via Chocolatey: `choco install mongodb`
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or if installed manually, run:
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `backend/.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alz-foresight
   ```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Seed the Database
```bash
npm run seed
```

This will create:
- **Doctor account:** doctor@test.com / password123
- **7 Patient accounts:** All with password "password123"
  - audrey.mann@test.com
  - rudy.hicks@test.com
  - johanna.ebert@test.com
  - armando.bode@test.com
  - bessie.stehr@test.com
  - tomas.denesik@test.com
  - paulette.fadel@test.com

### 5. Start Backend Server
```bash
npm run dev
```

Server will run on: http://localhost:5000

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
cd ..
npm install
```

### 2. Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on: http://localhost:5173

## Usage

1. **Access the application:**
   - Open browser to http://localhost:5173

2. **Login as Doctor:**
   - Email: doctor@test.com
   - Password: password123
   - Role: Select "Doctor"

3. **Login as Patient:**
   - Use any patient email above
   - Password: password123
   - Role: Select "Patient"

4. **Features:**
   - Doctor can view all appointments
   - Real-time data from MongoDB
   - Statistics dashboard
   - Patient management
   - Medical records

## API Endpoints

Base URL: http://localhost:5000/api

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Appointments
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get appointment by ID
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

### Patients
- `GET /patients` - Get all patients (doctor only)
- `GET /patients/:id` - Get patient by ID
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Doctors
- `GET /doctors` - Get all doctors
- `GET /doctors/:id` - Get doctor by ID
- `PUT /doctors/:id` - Update doctor profile
- `GET /doctors/:id/statistics` - Get doctor statistics

### Medical Records
- `GET /medical-records/patient/:patientId` - Get patient records
- `POST /medical-records` - Create record (doctor only)
- `PUT /medical-records/:id` - Update record
- `DELETE /medical-records/:id` - Delete record

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `net start MongoDB`
- Check MongoDB connection string in `backend/.env`
- Try using MongoDB Atlas cloud instead

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: Change port in `vite.config.js`

### CORS Errors
- Make sure backend is running on port 5000
- Check CORS configuration in `backend/server.js`

## Technology Stack

**Frontend:**
- React 18.2.0
- React Router DOM
- Axios
- Tailwind CSS

**Backend:**
- Node.js
- Express.js 4.18.2
- MongoDB with Mongoose 8.0.3
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
3D brain Dashboard/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   ├── seed.js          # Database seeder
│   └── .env            # Environment variables
├── src/
│   ├── pages/          # React pages
│   ├── services/       # API service layer
│   └── main.jsx        # App entry point
└── package.json
```
