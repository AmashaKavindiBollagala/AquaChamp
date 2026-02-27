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
import securityRoutes from "./routes/securityRoutes.js";

// Component 4 — Hygiene & Water Tracker (Dushani)
import activityRoutes from './routes/amasha-activityRoutes.js';
import waterRoutes from './routes/amasha-waterRoutes.js';
import pointsRoutes from './routes/amasha-pointsRoutes.js';

const app = express();
const port = 4000;

//  Middleware 
app.use(logger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use('/api/security', securityRoutes);

// Component 4 routes
app.use('/api/activities', activityRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/amasha-points', amashapointsRoutes);

//  DB 
connectDB();

//  Health check 


//kaveesha routes
import securityRoutes from "./routes/securityRoutes.js";


//kaveesha use routes
app.use("/api/security", securityRoutes);


// APP PORT AND LISTEN
app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});