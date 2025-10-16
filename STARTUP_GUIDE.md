# Alzheimer Care Dashboard - Complete Startup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v14+) installed
- ✅ MongoDB installed and running (or MongoDB Atlas account)
- ✅ npm or yarn package manager

## Quick Start (Windows PowerShell)

### Step 1: Set Execution Policy (Required for Windows)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Step 2: Install MongoDB (if not installed)

**Option A: Local MongoDB**
1. Download from: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Verify it's running: `mongod --version`

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `ADNI-MULTIMODAL/Backend/.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alzheimer-care
   ```

### Step 3: Start Backend Server

Open Terminal 1:
```powershell
# Set execution policy
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Navigate to backend
cd ADNI-MULTIMODAL/Backend

# Install dependencies (first time only)
npm install

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

### Step 4: Start Frontend Application

Open Terminal 2 (new terminal):
```powershell
# Set execution policy
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Navigate to frontend
cd ADNI-MULTIMODAL/Frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm start
```

Frontend will run on: **http://localhost:3000**

## Verification

### Backend Health Check
Open browser and visit:
- http://localhost:5000 - API welcome message
- http://localhost:5000/api/health - Health check endpoint

### Frontend
- http://localhost:3000 - Dashboard application

## Troubleshooting

### Issue 1: PowerShell Execution Policy Error
```
Error: File cannot be loaded. The file is not digitally signed.
```
**Solution:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Issue 2: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solutions:**
1. **Start MongoDB Service:**
   ```powershell
   # Windows
   net start MongoDB
   
   # Or check if MongoDB is running
   Get-Service MongoDB
   ```

2. **Use MongoDB Atlas (Cloud):**
   - Update `.env` file with Atlas connection string
   - Whitelist your IP address in Atlas dashboard

3. **Install MongoDB:**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation wizard
   - Start MongoDB service

### Issue 3: Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 4: Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:**
```powershell
# Reinstall dependencies
cd ADNI-MULTIMODAL/Backend
npm install

# Or for frontend
cd ADNI-MULTIMODAL/Frontend
npm install
```

### Issue 5: CORS Errors
If you see CORS errors in browser console:
- Ensure backend is running on port 5000
- Ensure frontend is running on port 3000
- Check browser console for specific error messages

## Environment Configuration

### Backend (.env file location: `ADNI-MULTIMODAL/Backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/alzheimer-care
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=30d
```

### Frontend
No .env file needed for basic setup. Frontend is configured to connect to `http://localhost:5000`

## API Testing

### Using Browser
Visit: http://localhost:5000/api/health

### Using Postman/Thunder Client

1. **Register User:**
   ```
   POST http://localhost:5000/api/auth/register
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

2. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json
   
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Get Patients (requires token):**
   ```
   GET http://localhost:5000/api/patients
   Authorization: Bearer <your-jwt-token>
   ```

## Development Workflow

### Making Changes

**Backend Changes:**
- Edit files in `ADNI-MULTIMODAL/Backend/`
- Server auto-restarts (nodemon)
- Check terminal for errors

**Frontend Changes:**
- Edit files in `ADNI-MULTIMODAL/Frontend/src/`
- Browser auto-refreshes
- Check browser console for errors

### Stopping Servers

Press `Ctrl + C` in each terminal to stop the servers.

## Project Structure

```
ADNI-MULTIMODAL/
├── Backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── .env               # Environment variables
│   ├── server.js          # Entry point
│   └── package.json       # Dependencies
│
├── Frontend/               # React Application
│   ├── public/            # Static files
│   ├── src/               # React components
│   │   ├── components/    # UI components
│   │   ├── App.js         # Main component
│   │   └── index.js       # Entry point
│   └── package.json       # Dependencies
│
└── Model/                  # ML Models (Jupyter notebooks)
```

## Next Steps

1. ✅ Start both servers
2. ✅ Open http://localhost:3000 in browser
3. ✅ Explore the dashboard
4. ✅ Test API endpoints
5. ✅ Add patients and track assessments

## Support

For issues:
1. Check this troubleshooting guide
2. Review terminal error messages
3. Check browser console (F12)
4. Verify MongoDB is running
5. Ensure all dependencies are installed

## Production Deployment

For production deployment:
1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas for database
4. Deploy backend to Heroku/Railway/Render
5. Deploy frontend to Vercel/Netlify
6. Update CORS settings with production URLs

---

**Happy Coding! 🚀**
