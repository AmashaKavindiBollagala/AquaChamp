import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';


const app = express();
const port = 4000;

//MIDDLEWEARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//DB
connectDB();

//ROUTES

//kaveesha
import testSecurityRoutes from './controllers/testSecurityRoutes.js';

app.use('/api/test', testSecurityRoutes);

import testPasswordValidationRoutes from "./controllers/testPasswordValidationRoutes.js";

app.use("/api/test", testPasswordValidationRoutes);



//APP PORT AND LISTEN
app.get('/', (req,res) => {
    res.send('API WORKING');

});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});