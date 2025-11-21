import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import feeRoutes from './routes/fees.js';
import hostelRoutes from './routes/hostels.js';
import examRoutes from './routes/exams.js';
import dashboardRoutes from './routes/dashboard.js';
import logRoutes from './routes/logs.js';

import errorHandler from './middleware/error.js';
import { requestLogger } from './middleware/logging.js';

dotenv.config();

const app = express();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: ['http://localhost:5173', 'https://sih-campus-one-three.vercel.app'] , 
  credentials: true
}));

// Rate limiting - FIXED: More generous limits for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reasonable limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except health check
//app.use(limiter);

// More generous rate limiting specifically for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Apply specific rate limiting to auth routes
//app.use('/api/auth/login', authLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use(requestLogger);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_erp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;