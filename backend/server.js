import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// console.log('first server')
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    console.log('fourth route');
    res.send('Football E-commerce Backend Running!');
});

const PORT = process.env.PORT || 5000;
     connectDB();
    app.listen(PORT, () => console.log(`port running ${PORT}`));

