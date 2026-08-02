import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed");
        console.error(error);
    }
};

export default connectDb;