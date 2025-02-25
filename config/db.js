import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const DB_URL = process.env.MONGO_URI

export const connectDB = async () => {
	try {
		await mongoose.connect(DB_URL)
		console.log("MongoDB connected.")
	} catch (error) {
		console.error(`Error: ${error.message}`)
		process.exit(1)
	}
}
