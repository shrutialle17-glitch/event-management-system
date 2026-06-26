const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require("./config/db");
const { connectCloudinary } = require('./config/cloudinary');
dotenv.config();
const { errorHandler } = require('./middleware/errorHandler.middleware');

// Route files
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const qrRoutes = require('./routes/qr.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const galleryRoutes = require('./routes/gallery.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const attendanceRoutes = require('./routes/attendance.routes');

const startScheduler = require('./jobs/scheduler');

// Connect to database and cloudinary
connectDB();
connectCloudinary();

startScheduler();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
