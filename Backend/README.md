# Alzheimer Care Dashboard - Backend API

A comprehensive Node.js/Express REST API for managing Alzheimer's patient care with MongoDB database integration.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 👥 **Patient Management** - CRUD operations for patient profiles
- 📊 **Cognitive Assessments** - Track memory, cognitive, and behavioral scores
- 💊 **Medication Tracking** - Manage prescriptions and dosage schedules
- 🏃 **Activity Logging** - Record daily activities and mood tracking
- 📅 **Appointment Scheduling** - Manage medical appointments
- 🔒 **Security** - Helmet, rate limiting, CORS protection
- ✅ **Input Validation** - Express-validator for data integrity

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Navigate to Backend directory**
   ```bash
   cd ADNI-MULTIMODAL/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env` file is already created with default values. Update it with your settings:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/alzheimer-care
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running:
   - **Local MongoDB**: `mongod`
   - **MongoDB Atlas**: Use the connection string from your cluster

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/updatedetails` | Update user details | Yes |
| PUT | `/updatepassword` | Update password | Yes |

### Patient Routes (`/api/patients`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all patients | Yes |
| GET | `/:id` | Get single patient | Yes |
| POST | `/` | Create patient | Yes |
| PUT | `/:id` | Update patient | Yes |
| DELETE | `/:id` | Delete patient (soft) | Yes |
| GET | `/search/:query` | Search patients | Yes |

### Assessment Routes (`/api/assessments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all assessments | Yes |
| GET | `/:id` | Get single assessment | Yes |
| GET | `/patient/:patientId` | Get patient assessments | Yes |
| GET | `/stats/:patientId` | Get assessment statistics | Yes |
| POST | `/` | Create assessment | Yes |
| PUT | `/:id` | Update assessment | Yes |
| DELETE | `/:id` | Delete assessment | Yes |

### Medication Routes (`/api/medications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all medications | Yes |
| GET | `/:id` | Get single medication | Yes |
| GET | `/patient/:patientId` | Get patient medications | Yes |
| POST | `/` | Create medication | Yes |
| PUT | `/:id` | Update medication | Yes |
| PUT | `/:id/taken` | Update last taken time | Yes |
| DELETE | `/:id` | Delete medication (soft) | Yes |

### Activity Routes (`/api/activities`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all activities | Yes |
| GET | `/:id` | Get single activity | Yes |
| GET | `/patient/:patientId` | Get patient activities | Yes |
| GET | `/type/:type` | Get activities by type | Yes |
| GET | `/range/:startDate/:endDate` | Get activities by date range | Yes |
| POST | `/` | Create activity | Yes |
| PUT | `/:id` | Update activity | Yes |
| DELETE | `/:id` | Delete activity | Yes |

### Appointment Routes (`/api/appointments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all appointments | Yes |
| GET | `/:id` | Get single appointment | Yes |
| GET | `/patient/:patientId` | Get patient appointments | Yes |
| GET | `/upcoming` | Get upcoming appointments | Yes |
| POST | `/` | Create appointment | Yes |
| PUT | `/:id` | Update appointment | Yes |
| PUT | `/:id/status` | Update appointment status | Yes |
| DELETE | `/:id` | Delete appointment | Yes |

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Patient
```bash
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Margaret Thompson",
  "age": 72,
  "dateOfBirth": "1952-03-15",
  "gender": "Female",
  "diagnosis": "Alzheimer's Disease",
  "stage": "Mild",
  "caregiverId": "C001",
  "emergencyContact": {
    "name": "Sarah Thompson",
    "relationship": "Daughter",
    "phone": "+1234567890"
  }
}
```

### Create Assessment
```bash
POST /api/assessments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "60d5ec49f1b2c72b8c8e4f1a",
  "date": "2024-03-20",
  "memoryScore": 68,
  "cognitiveScore": 63,
  "behaviorScore": 75,
  "notes": "Minor decline in memory"
}
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: Prevents brute force attacks
4. **Helmet**: Sets security HTTP headers
5. **CORS**: Configured for frontend origin
6. **Input Validation**: express-validator
7. **MongoDB Injection Protection**: Mongoose sanitization

## Database Models

### User
- name, email, password (hashed)
- role (user, admin, caregiver)
- isActive status

### Patient
- Personal info (name, age, gender, DOB)
- Medical info (diagnosis, stage)
- Emergency contact details
- Caregiver information

### Assessment
- Patient reference
- Scores (memory, cognitive, behavior)
- Date and notes

### Medication
- Patient reference
- Name, dosage, frequency
- Schedule and last taken time

### Activity
- Patient reference
- Type, description, duration
- Date and mood tracking

### Appointment
- Patient reference
- Date, time, doctor
- Type, location, status
- Reminder settings

## Development

### Project Structure
```
Backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── assessmentController.js
│   ├── medicationController.js
│   ├── activityController.js
│   └── appointmentController.js
├── middleware/
│   └── auth.js            # JWT authentication
├── models/
│   ├── User.js
│   ├── Patient.js
│   ├── Assessment.js
│   ├── Medication.js
│   ├── Activity.js
│   └── Appointment.js
├── routes/
│   ├── auth.js
│   ├── patients.js
│   ├── assessments.js
│   ├── medications.js
│   ├── activities.js
│   └── appointments.js
├── .env
├── .gitignore
├── package.json
└── server.js              # Entry point
```

## Testing with Postman/Thunder Client

1. Import the API endpoints
2. Set environment variable for base URL: `http://localhost:5000/api`
3. After login, set the JWT token in Authorization header
4. Test all CRUD operations

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-secret-key>
JWT_EXPIRE=30d
```

### Deployment Platforms
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **DigitalOcean**: Use App Platform

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
- Update `origin` in server.js CORS config
- Ensure frontend URL matches

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is part of the ADNI-MULTIMODAL Alzheimer Care Dashboard.

## Support

For issues and questions, please open an issue in the repository.
