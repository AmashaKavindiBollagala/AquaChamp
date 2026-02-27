import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { logger } from './middleware/amasha-logger.js';
import authRoutes from './routes/amasha-authRoutes.js';
import notesRoutes from './routes/amasha-noteRoutes.js';
import userRoutes from './routes/dushani-userRoutes.js';
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
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

// Component 4 routes
app.use('/api/activities', activityRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/points', pointsRoutes);

//  DB 
connectDB();

//  Health check 
app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});