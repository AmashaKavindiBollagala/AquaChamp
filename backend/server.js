import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { logger } from './middleware/amasha-logger.js';
import authRoutes from './routes/amasha-authRoutes.js';
import notesRoutes from './routes/amasha-noteRoutes.js';
import userRoutes from './routes/dushani-userRoutes.js';
import badgeRoutes from './routes/dushani-badgeRoutes.js';
import progressRoutes from './routes/dushani-progressRoutes.js';
import pointsRoutes from './routes/dushani-pointsRoutes.js';
import levelRoutes from './routes/dushani-levelRoutes.js';
import badgeNotificationRoutes from './routes/dushani-badgeNotificationRoutes.js';
import analyticsRoutes from './routes/dilshara-analytics.js';
import adminRoutes from './routes/dilshara-adminRoutes.js';
import gameRoutes from './routes/dilshara-gameRoutes.js';
import quizRoutes from './routes/dilshara-quizRoutes.js';
import trueFalseRoutes from './routes/dilshara-trueFalseRoutes.js';
import securityRoutes from "./routes/securityRoutes.js";
import activityRoutes from './routes/amasha-activityRoutes.js';
import waterRoutes from './routes/amasha-waterRoutes.js';
import amashapointsRoutes from './routes/amasha-pointsRoutes.js';
import topicRoutes from "./routes/kaveesha-topicRoutes.js";
import subtopicRoutes from "./routes/kaveesha-subtopicRoutes.js";
import kaveeshaMiniQuizRoutes from "./routes/kaveesha-miniquizRoutes.js";
import './kaveesha-delete-unverified-users.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(logger);
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://aquachamp.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/badge-notifications', badgeNotificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/quizzes', quizRoutes);
app.use('/truefalse', trueFalseRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/amasha-points', amashapointsRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/subtopics", subtopicRoutes);
app.use("/api/kaveesha-miniquiz", kaveeshaMiniQuizRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API WORKING');
});

// DB + Server Start
connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });