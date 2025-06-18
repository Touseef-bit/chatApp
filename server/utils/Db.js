import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config({path:'../.env'})

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connect to database')
    } catch (error) {
        console.log(error)
    }
}

export default connectToDb

