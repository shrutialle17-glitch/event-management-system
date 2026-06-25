const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const path = require('path');

// Load environment variables (robust path resolution)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load Models
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Gallery = require('../models/Gallery');
const Badge = require('../models/Badge');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventio_db');
    console.log('MongoDB Connected for Seeding');

    // 1. Clear database
    console.log('Clearing database...');
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    await Attendance.deleteMany();
    await Feedback.deleteMany();
    await Gallery.deleteMany();
    await Badge.deleteMany();

    // 2. Create Users (Admin, Organizer, Standard Users)
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        name: 'System Admin',
        email: 'admin@eventio.com',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      },
      {
        name: 'Tech Events Co',
        email: 'organizer@eventio.com',
        password: hashedPassword,
        role: 'organizer',
        isEmailVerified: true
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true
      }
    ];

    const users = await User.insertMany(usersData);
    const admin = users[0];
    const organizer = users[1];
    const user1 = users[2];
    const user2 = users[3];

    // 3. Create Events
    console.log('Creating events...');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    const eventsData = [
      {
        title: 'Global Tech Summit 2024',
        description: 'The premier technology conference featuring talks from industry leaders on AI, Web3, and Cloud Native technologies.',
        organizer: organizer._id,
        category: 'conference',
        date: nextMonth,
        time: '09:00 AM',
        venue: 'Moscone Center, San Francisco',
        capacity: 500,
        registeredCount: 0,
        price: 299,
        status: 'published',
        isOnline: false
      },
      {
        title: 'React Performance Workshop',
        description: 'Deep dive into React 18, Server Components, and advanced performance optimization techniques.',
        organizer: organizer._id,
        category: 'workshop',
        date: nextMonth,
        time: '02:00 PM',
        venue: 'https://zoom.us/j/123456789',
        capacity: 50,
        registeredCount: 0,
        price: 0,
        status: 'published',
        isOnline: true
      },
      {
        title: 'Past Networking Mixer',
        description: 'Local networking event for startup founders and investors.',
        organizer: organizer._id,
        category: 'networking',
        date: pastDate,
        time: '06:00 PM',
        venue: 'Downtown Tech Hub',
        capacity: 100,
        registeredCount: 0,
        price: 0,
        status: 'completed',
        isOnline: false
      }
    ];

    await Event.insertMany(eventsData);

    // 4. Create Badges
    console.log('Creating badges...');
    const badgesData = [
      { key: 'first-event', label: 'First Event Attended', description: 'Attended your first event', icon: '🏆' },
      { key: 'five-events', label: 'Regular Attendee', description: 'Checked in to 5 events', icon: '🌟' },
      { key: 'early-bird', label: 'Early Bird', description: 'Registered more than 7 days before an event', icon: '🐦' },
      { key: 'feedback-giver', label: 'Voice Heard', description: 'Submitted feedback for an event', icon: '🗣️' }
    ];
    await Badge.insertMany(badgesData);

    console.log('Database successfully seeded!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@eventio.com / password123');
    console.log('Organizer: organizer@eventio.com / password123');
    console.log('User: john@example.com / password123');
    
    process.exit();
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
