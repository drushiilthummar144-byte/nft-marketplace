const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nft_marketplace');

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\n=========================================`);
        console.error(`🔥 MONGODB CONNECTION ERROR 🔥`);
        console.error(`Error: ${error.message}`);
        console.error(`Please make sure you have installed and started MongoDB on your system.`);
        console.error(`Or update MONGO_URI in .env with your MongoDB Atlas connection string.`);
        console.error(`=========================================\n`);
        // process.exit(1); // Do not crash the app so other routes can load
    }
};

module.exports = connectDB;
