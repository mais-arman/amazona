import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';

dotenv.config();

// =======================
// DB Connection
// =======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

// =======================
// Middleware
// =======================
const allowedOrigins = [
  'http://amazona-frontend-366707332486-us-east-1-an.s3-website-us-east-1.amazonaws.com',
  'https://d2rnhi1i7h8w6o.cloudfront.net',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// API Routes
// =======================
app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.get('/api/keys/google', (req, res) => {
  res.send({ key: process.env.GOOGLE_API_KEY || '' });
});

app.use('/api/upload', uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);

// =======================
// Frontend Build
// =======================
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/build/index.html')),
);

// =======================
// Error Handler
// =======================
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

// =======================
// Server Start
// =======================
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});
