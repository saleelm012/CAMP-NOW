const mongoose = require('mongoose');

const connectDB = async () => {
   try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('connected succcessfuly');      
   }
   catch(error) {
    console.error('connection failde', error.message)
    process.exit(1);
   }
}

module.exports = connectDB;