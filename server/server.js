import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import connectDb from './config/db.js';
import 'dotenv/config';
import userRoutes from './routes/userRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import connectCloudinary from './config/cloudinary.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDb();
await connectCloudinary();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ['http://localhost:3000', 'https://greencart-frontend.vercel.app'];

// allow multiple origins for CORS
app.use(cors({origin: allowedOrigins, credentials: true})); 

app.use('/api/user', userRouter);
app.use('/api/seller',sellerRouter);

app.get ('/', (req,res)=>{
    res.send("API is running...");
})



app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`);
})

