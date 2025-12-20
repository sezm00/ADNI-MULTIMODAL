const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    console.log('Existing data cleared');

    // Create a doctor
    const doctor = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'doctor',
      age: 38,
      gender: 'Female',
      phone: '+1-555-0123',
      address: '123 Medical Center, New York, NY',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop'
    });
    console.log('Doctor created:', doctor.email);

    // Create patients one by one to trigger pre-save hooks
    const patientData = [
      {
        name: 'John Patient',
        email: 'patient@test.com',
        password: 'password123',
        role: 'patient',
        age: 38,
        gender: 'Male',
        phone: '+1-555-1000',
        address: '100 Main St, New York, NY',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      {
        name: 'Audrey Mann',
        email: 'audrey.mann@test.com',
        password: 'password123',
        role: 'patient',
        age: 42,
        gender: 'Female',
        phone: '+1-555-1001',
        address: '456 Oak St, Brooklyn, NY',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      {
        name: 'Rudy Hicks',
        email: 'rudy.hicks@test.com',
        password: 'password123',
        role: 'patient',
        age: 28,
        gender: 'Male',
        phone: '+1-555-1002',
        address: '789 Elm Ave, Queens, NY',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      },
      {
        name: 'Johanna Ebert',
        email: 'johanna.ebert@test.com',
        password: 'password123',
        role: 'patient',
        age: 35,
        gender: 'Female',
        phone: '+1-555-1003',
        address: '321 Pine Rd, Manhattan, NY',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      {
        name: 'Armando Bode',
        email: 'armando.bode@test.com',
        password: 'password123',
        role: 'patient',
        age: 51,
        gender: 'Male',
        phone: '+1-555-1004',
        address: '654 Maple Dr, Bronx, NY',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      {
        name: 'Bessie Stehr',
        email: 'bessie.stehr@test.com',
        password: 'password123',
        role: 'patient',
        age: 29,
        gender: 'Female',
        phone: '+1-555-1005',
        address: '987 Cedar Ln, Staten Island, NY',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
      },
      {
        name: 'Tomas Denesik',
        email: 'tomas.denesik@test.com',
        password: 'password123',
        role: 'patient',
        age: 45,
        gender: 'Male',
        phone: '+1-555-1006',
        address: '147 Birch St, Long Island, NY',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
      },
      {
        name: 'Paulette Fadel',
        email: 'paulette.fadel@test.com',
        password: 'password123',
        role: 'patient',
        age: 31,
        gender: 'Female',
        phone: '+1-555-1007',
        address: '258 Spruce Ct, White Plains, NY',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      }
    ];

    const patients = [];
    for (const data of patientData) {
      const patient = await User.create(data);
      patients.push(patient);
    }
    console.log(`${patients.length} patients created`);

    // Create appointments
    const today = new Date();
    const appointments = await Appointment.insertMany([
      {
        patientId: patients[0]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '08:00',
        duration: 50,
        status: 'completed',
        condition: 'Migraine Headache',
        symptoms: 'Severe bilateral headache with aura',
        consultationNotes: 'Severe bilateral migraine with aura. Patient reports increased frequency over past 3 weeks. Currently on Sumatriptan 100mg. Consider adjusting dosage or switching to preventive medication.',
        fee: 150,
        paymentStatus: 'Paid',
        cardInfo: 'Audrey M. - Visa **** **** **** 3421'
      },
      {
        patientId: patients[1]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '09:00',
        duration: 40,
        status: 'completed',
        condition: 'Hypertension Follow-up',
        symptoms: 'Regular blood pressure monitoring',
        consultationNotes: 'Blood pressure readings have improved since starting Lisinopril 10mg daily. Patient compliant with medication and low-sodium diet. Continue current regimen and schedule follow-up in 3 months.',
        fee: 120,
        paymentStatus: 'Paid',
        cardInfo: 'Rudy H. - Mastercard **** **** **** 8765'
      },
      {
        patientId: patients[2]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '09:45',
        duration: 50,
        status: 'current',
        condition: 'Memory Assessment',
        symptoms: 'Progressive memory difficulties',
        consultationNotes: 'Patient presenting with progressive memory difficulties and mild cognitive impairment. Family history of early-onset Alzheimer\'s. Recommended comprehensive neurological assessment and MRI scan to rule out dementia.',
        fee: 200,
        paymentStatus: 'Pending',
        cardInfo: 'Johanna E. - Amex **** **** **** 1098'
      },
      {
        patientId: patients[3]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '10:30',
        duration: 50,
        status: 'pending',
        condition: 'Diabetes Checkup',
        symptoms: 'Type 2 diabetes management',
        consultationNotes: 'Type 2 diabetes management. HbA1c levels slightly elevated at 7.8%. Adjusting Metformin dosage to 1000mg twice daily. Emphasizing importance of regular exercise and carbohydrate monitoring.',
        fee: 180,
        paymentStatus: 'Paid',
        cardInfo: 'Armando B. - Visa **** **** **** 5432'
      },
      {
        patientId: patients[4]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '11:00',
        duration: 50,
        status: 'pending',
        condition: 'Arthritis Pain',
        symptoms: 'Bilateral hand and knee pain',
        consultationNotes: 'Rheumatoid arthritis with bilateral hand and knee involvement. Patient reports morning stiffness lasting 2+ hours. Current on Methotrexate 15mg weekly. Consider adding biologic agent if symptoms persist.',
        fee: 175,
        paymentStatus: 'Insurance Pending',
        cardInfo: 'Bessie S. - Mastercard **** **** **** 6677'
      },
      {
        patientId: patients[5]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '12:00',
        duration: 50,
        status: 'pending',
        condition: 'Chest Pain Evaluation',
        symptoms: 'Acute chest pain',
        consultationNotes: 'Acute chest pain evaluation. ECG shows normal sinus rhythm, no ST changes. Troponin levels negative. Likely musculoskeletal origin. Patient experiencing work-related stress. Prescribe NSAIDs and recommend stress management.',
        fee: 220,
        paymentStatus: 'Paid',
        cardInfo: 'Tomas D. - Visa **** **** **** 9012'
      },
      {
        patientId: patients[6]._id,
        doctorId: doctor._id,
        date: today.toISOString().split('T')[0],
        time: '12:45',
        duration: 50,
        status: 'pending',
        condition: 'Annual Physical',
        symptoms: 'Routine checkup',
        consultationNotes: 'Annual preventive health examination. All vital signs within normal limits. Labs show optimal cholesterol and glucose levels. Patient maintains active lifestyle. No concerns at this time. Schedule next annual in 12 months.',
        fee: 140,
        paymentStatus: 'Paid',
        cardInfo: 'Paulette F. - Discover **** **** **** 3344'
      }
    ]);
    console.log(`${appointments.length} appointments created`);

    console.log('\n=== Seed Data Summary ===');
    console.log('Doctor Account:');
    console.log('  Email: doctor@test.com');
    console.log('  Password: password123');
    console.log('\nPatient Accounts (all with password: password123):');
    patients.forEach(p => console.log(`  - ${p.email}`));
    console.log('\nDatabase seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
