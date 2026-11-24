import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// console.log('first server')
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    console.log('fourth route');
    res.send('Football E-commerce Backend Running!');
});

const PORT = process.env.PORT || 5000;
     connectDB();
    app.listen(PORT, () => console.log(`port running ${PORT}`));

