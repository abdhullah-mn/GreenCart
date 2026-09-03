import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDb from './config/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoutes.js';
import sellerRouter from './routes/sellerRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import addressRouter from './routes/addressRoutes.js';
import orderRouter from './routes/orderRoute.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDb();
await connectCloudinary();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'https://greencart-frontend.vercel.app'
];

const isLocalOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1'].includes(url.hostname)
      && ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS blocked for origin: ' + origin));
  },
  credentials: true,
}));

app.use('/api/user', userRouter);
app.use('/api/seller',sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

app.get ('/', (req,res)=>{
    res.send("API is running...");
})



app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`);
})

