import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';

const testUser = async () => {
    try {
        await connectDB();

        const hashedPassword = await bcrypt.hash('TestPassword123', 10);

        const user = await User.create({
            name: 'Saleel',
            email: 'saleel@example.com',
            password: hashedPassword,
            phone: '9876543210'
        });

        console.log('User created successfully');
        console.log(user);

        process.exit(0);

    } catch (error) {
        console.log('Error:', error.message);
        process.exit(1);
    }
};

testUser();
