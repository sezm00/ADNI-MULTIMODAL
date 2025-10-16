# Alzheimer Care Dashboard - ADNI Multimodal Project

A comprehensive web-based healthcare management system for Alzheimer's disease patients, featuring patient tracking, cognitive assessments, medication management, and activity monitoring.

## 🌟 Features

### Frontend (React)
- 📊 **Interactive Dashboard** - Real-time patient health overview
- 👤 **Patient Profile Management** - Comprehensive patient demographics
- 🧠 **Cognitive Progress Tracking** - Visual charts showing assessment trends
- 💊 **Medication Management** - Track prescriptions and dosage schedules
- 🏃 **Activity Logging** - Daily activities with mood tracking
- 📅 **Appointment Scheduling** - Manage doctor appointments and reminders
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

### Backend (Node.js/Express)
- 🔐 **JWT Authentication** - Secure user registration and login
- 🗄️ **MongoDB Integration** - Robust data persistence
- 🛡️ **Security Features** - Helmet, CORS, rate limiting, password hashing
- ✅ **Input Validation** - Express-validator for data integrity
- 📝 **RESTful API** - Well-structured endpoints for all operations
- 📊 **Statistics & Analytics** - Assessment trends and patient insights

## 🏗️ Project Structure

```
ADNI-MULTIMODAL/
├── Frontend/                 # React Application
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── App.js          # Main Application
│   │   └── index.js        # Entry Point
│   ├── public/             # Static Assets
│   └── package.json        # Dependencies
│
├── Backend/                 # Node.js/Express API
│   ├── config/             # Database Configuration
│   ├── controllers/        # Request Handlers
│   ├── middleware/         # Authentication Middleware
│   ├── models/            # MongoDB Models
│   ├── routes/            # API Routes
│   ├── server.js          # Server Entry Point
│   └── package.json       # Dependencies
│
├── Model/                  # Machine Learning Models
│   └── beta_model.ipynb   # Jupyter Notebook
│
└── dashboard/             # Original Dashboard (Reference)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ADNI-MULTIMODAL
```

2. **Setup Backend**
```bash
cd Backend
npm install

# Create .env file with:
# NODE_ENV=development
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/alzheimer-care
# JWT_SECRET=your-secret-key
# JWT_EXPIRE=30d

npm run dev
```

3. **Setup Frontend**
```bash
cd Frontend
npm install
npm start
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Assessments
- `GET /api/assessments/patient/:patientId` - Get patient assessments
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get assessment by ID
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment
- `GET /api/assessments/patient/:patientId/stats` - Get statistics

### Medications
- `GET /api/medications/patient/:patientId` - Get patient medications
- `POST /api/medications` - Create medication
- `GET /api/medications/:id` - Get medication by ID
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Activities
- `GET /api/activities/patient/:patientId` - Get patient activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Appointments
- `GET /api/appointments/patient/:patientId` - Get patient appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

## 🛠️ Technologies Used

### Frontend
- React 19.2.0
- Tailwind CSS
- Recharts (Data Visualization)
- Lucide React (Icons)
- Axios (HTTP Client)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (Authentication)
- bcryptjs (Password Hashing)
- Helmet (Security)
- CORS
- Express Validator

## 📦 Database Models

- **User** - Authentication and user management
- **Patient** - Patient demographics and medical information
- **Assessment** - Cognitive assessment scores and notes
- **Medication** - Prescription and dosage tracking
- **Activity** - Daily activities and mood tracking
- **Appointment** - Doctor appointments and scheduling

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/alzheimer-care
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- ADNI (Alzheimer's Disease Neuroimaging Initiative)
- Healthcare professionals who provided insights
- Open source community

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Add real-time notifications
- [ ] Implement data export functionality
- [ ] Add multi-language support
- [ ] Integrate machine learning predictions
- [ ] Mobile app development
- [ ] Telemedicine integration

---

**Made with ❤️ for Alzheimer's care**
