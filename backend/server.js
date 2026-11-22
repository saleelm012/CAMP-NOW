require("dotenv").config();


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)


app.get('/',(req,res) => {
    res.send('Football E-commerce Backend Running!')
});

const PORT = process.env.PORT || 5000;


const serverStart = async () => {
    await connectDB();

     app.listen(PORT, () => console.log(`port running ${PORT}`));
};

serverStart();