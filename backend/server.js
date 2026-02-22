import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';

const app = express();
const port = 4000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
connectDB();

// ROUTES
import userRoutes from './routes/dushani-userRoutes.js';


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