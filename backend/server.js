import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import addressRoutes from './routes/addressRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";

import path from 'node:path';
import multer from 'multer';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'))
);

// console.log('first server')
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);

app.use("/api/admin", adminRoutes);

app.get('/', (req, res) => {
    console.log('fourth route');
    res.send('Football E-commerce Backend Running!');
});

app.use((err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Image size must not exceed 2 MB'
            });
        }

        return res.status(400).json({
            message: 'Invalid file upload'
        });
    }

    if (
        err.message ===
        'Only JPG, PNG and WEBP images are allowed'
    ) {
        return res.status(400).json({
            message: err.message
        });
    }

    next(err);
});

const PORT = process.env.PORT || 5000;
     connectDB();
    app.listen(PORT, () => console.log(`port running ${PORT}`));

