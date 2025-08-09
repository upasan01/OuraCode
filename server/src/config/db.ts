// MongoDb connection setup
import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL as string)
        console.log("MongoDB connceted")
    }catch(err){
        console.error("MongoDB connection error: ", err)
    }
}