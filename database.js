import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri=process.env.DB_URI



const connectDB = async() => {
    await mongoose.connect(uri);
}

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
});

database.once('connected', () => {
    console.log('Database connected!');
})

export default connectDB