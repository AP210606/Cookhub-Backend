require('dotenv').config();
const mongoose = require('mongoose');
const Cook = require('../models/Cook');
const Application = require('../models/Application');
const connectDB = require('../config/db');

connectDB();

const seedData = async () => {
  try {
    await Cook.deleteMany({});
    await Application.deleteMany({});

    const sampleCooks = [
    { name: 'John Doe', phone: '1234567890', specialties: ['Italian'], serviceAreas: ['New York'], location: 'NewYork', isAvailable: true },
    { name: 'Jane Smith', phone: '0987654321', specialties: ['Asian'], serviceAreas: ['Los Angeles'], location: 'LosAngeles', isAvailable: false },
    ];

    const sampleApplications = [
      {
        location: 'NewYork',
        applicantName: 'Alice Johnson',
        position: 'Head Cook',
        status: 'Pending'
      },
      {
        location: 'LosAngeles',
        applicantName: 'Bob Brown',
        position: 'Sous Chef',
        status: 'Pending'
      },
    ];

    await Cook.insertMany(sampleCooks);
    await Application.insertMany(sampleApplications);

    console.log('Sample data seeded!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();