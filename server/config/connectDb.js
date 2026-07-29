import mongoose from "mongoose";

const connectDb =async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected");
    }catch(error){
        console.log(`Database connection failed${error}`);
        
    }
}
export default connectDb;