// Shared in-memory user store — used when MongoDB is unavailable.
// Pre-seeded with the same test accounts as seed.js so login always works.
const bcrypt = require('bcryptjs');

// Passwords are synchronously hashed at startup (cost factor 10)
const hash = (pw) => bcrypt.hashSync(pw, 10);

const inMemoryUsers = [
  {
    id: 'doctor-seed-001',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@test.com',
    password: hash('password123'),
    role: 'doctor',
    age: 38,
    gender: 'Female',
    phone: '+1-555-0123',
    address: '123 Medical Center, New York, NY',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop'
  },
  {
    id: 'patient-seed-001',
    name: 'John Patient',
    email: 'patient@test.com',
    password: hash('password123'),
    role: 'patient',
    age: 38,
    gender: 'Male',
    phone: '+1-555-1000',
    address: '100 Main St, New York, NY',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
  },
  {
    id: 'patient-seed-002',
    name: 'Audrey Mann',
    email: 'audrey.mann@test.com',
    password: hash('password123'),
    role: 'patient',
    age: 42,
    gender: 'Female',
    phone: '+1-555-1001',
    address: '456 Oak St, Brooklyn, NY',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  }
];

module.exports = inMemoryUsers;
