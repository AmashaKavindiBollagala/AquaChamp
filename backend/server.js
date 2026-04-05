import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { logger } from './middleware/amasha-logger.js';
import authRoutes from './routes/amasha-authRoutes.js';
import notesRoutes from './routes/amasha-noteRoutes.js';
import userRoutes from './routes/dushani-userRoutes.js';
//dilshara
import adminRoutes from './routes/dilshara-adminRoutes.js';

const app = express();
const port = 4000;

//MIDDLEWEARES
app.use(logger);
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 


//Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/api/users', userRoutes);
//dilshara
app.use('/api/admin', adminRoutes);



// DB
connectDB();


import './kaveesha-delete-unverified-users.js';

//kaveesha routes
import securityRoutes from "./routes/securityRoutes.js";


//kaveesha use routes
app.use("/api/security", securityRoutes);


// use routes
app.use('/api/users', userRoutes);


// APP PORT AND LISTEN
app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});