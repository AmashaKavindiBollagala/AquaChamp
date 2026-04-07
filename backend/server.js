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
//dilshara
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

const app = express();
const port = 4000;

//  Middleware 
app.use(logger);
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 
app.use('/uploads', express.static('uploads')); 

app.use("/uploads", express.static("uploads"));

//  Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/badge-notifications', badgeNotificationRoutes);
//dilshara
app.use('/api/admin', adminRoutes);
app.use('/games', gameRoutes);
app.use('/quizzes', quizRoutes);
app.use('/truefalse', trueFalseRoutes);
app.use('/api/security', securityRoutes);

// Component 4 routes
app.use('/api/activities', activityRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/amasha-points', amashapointsRoutes);


// DB
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch((err) => {
  console.error('Database connection failed:', err);
});


import './kaveesha-delete-unverified-users.js';

//kaveesha routes
// import securityRoutes from "./routes/securityRoutes.js";


//kaveesha use routes
app.use("/api/security", securityRoutes);


// use routes
// app.use('/api/users', userRoutes); // Removed duplicate - already registered above
//  DB 
// connectDB();

app.use("/api/topics", topicRoutes);
app.use("/api/subtopics", subtopicRoutes);
app.use("/api/kaveesha-miniquiz", kaveeshaMiniQuizRoutes);


// APP PORT AND LISTEN
app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});