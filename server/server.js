import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import connectDb from './config/db.js';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDb();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true})); 

app.use('/api/users', userRoutes);


//allow multiple origins for CORS
const allowedOrigins = ['http://localhost:3000', 'https://greencart-frontend.vercel.app'];

app.get ('/', (req,res)=>{
    res.send("API is running...");
})



app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`);
})

