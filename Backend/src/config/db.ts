import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

export const connectDB = async () => {
    try{
        await mongoose.connect(MONGODB_URL as string);
        console.log("MongoDB connected!");
    }catch(err){
        console.log("MongoDB connect error: ", err)
    }
}