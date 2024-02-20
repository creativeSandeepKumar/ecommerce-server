import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export let dbInstance = undefined;

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);
        dbInstance = connectionInstance;
        console.log(`\n MongoDB connected! Db host: ${connectionInstance.connection.host}\n`);
    } catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
}

export default connectDB;