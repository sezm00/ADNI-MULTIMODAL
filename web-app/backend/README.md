# ALZ ForeSight - Backend API

Node.js/Express backend with MongoDB for ALZ ForeSight healthcare application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the backend directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alz-foresight
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Make sure MongoDB is running locally:
```bash
# Start MongoDB service
mongod
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user (patient/doctor)
- `POST /api/auth/login` - Login user

### Patients (`/api/patients`)
- `GET /api/patients` - Get all patients (doctor only)
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient profile
- `DELETE /api/patients/:id` - Delete patient (doctor/admin only)

### Doctors (`/api/doctors`)
- `GET /api/doctors` - Get all doctors (public)
- `GET /api/doctors/:id` - Get doctor by ID (public)
- `PUT /api/doctors/:id` - Update doctor profile (doctor only)
- `GET /api/doctors/:id/statistics` - Get doctor statistics (doctor only)

### Appointments (`/api/appointments`)
- `GET /api/appointments` - Get appointments (filtered by user role)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/doctor/:doctorId` - Get appointments by doctor
- `GET /api/appointments/patient/:patientId` - Get appointments by patient

### Medical Records (`/api/medical-records`)
- `GET /api/medical-records/patient/:patientId` - Get all records for patient
- `GET /api/medical-records/:id` - Get record by ID
- `POST /api/medical-records` - Create new record (doctor only)
- `PUT /api/medical-records/:id` - Update record (doctor only)
- `DELETE /api/medical-records/:id` - Delete record (doctor only)
- `GET /api/medical-records/patient/:patientId/type/:recordType` - Get records by type

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

Success:
```json
{
  "success": true,
  "data": {...}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
