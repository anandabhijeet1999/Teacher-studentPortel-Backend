const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Assignment = require('../models/Assignment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Assignment.deleteMany({});

    // Create demo users
    const teacher = new User({
      name: 'Abhijeet Teacher',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher'
    });

    const student1 = new User({
      name: 'Kashish Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    const student2 = new User({
      name: 'Deepak Student',
      email: 'student2@example.com',
      password: 'password123',
      role: 'student'
    });

    const student3 = new User({
      name: 'Annu Student',
      email: 'student2@example.com',
      password: 'password123',
      role: 'student'
    });

    await teacher.save();
    await student1.save();
    await student2.save();
    await student3.save();
    console.log('Demo users created successfully');

    // Create sample assignments
    const assignment1 = new Assignment({
      title: 'Mathematics Assignment - Calculus',
      description: 'Solve the following calculus problems and show your work step by step. Include all necessary calculations and explanations.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'published',
      teacher: teacher._id
    });

    const assignment2 = new Assignment({
      title: 'Physics Lab Report',
      description: 'Write a comprehensive lab report on the experiment conducted last week. Include hypothesis, methodology, results, and conclusions.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'draft',
      teacher: teacher._id
    });

    const assignment3 = new Assignment({
      title: 'Literature Essay',
      description: 'Analyze the themes in the assigned novel and write a 1000-word essay discussing the author\'s use of symbolism.',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      status: 'completed',
      teacher: teacher._id
    });

    await assignment1.save();
    await assignment2.save();
    await assignment3.save();

    console.log('Sample assignments created successfully');
    console.log('\nDemo data seeded successfully!');
    console.log('\nDemo Accounts:');
    console.log('Teacher: teacher@example.com / password123');
    console.log('Student: student@example.com / password123');
    console.log('Student 2: student2@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
