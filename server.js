import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import estateRoutes from "./routes/estateRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import cors from "cors"

dotenv.config()

const app = express()
app.use(express.json())

app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

const PORT = process.env.PORT

app.use("/api/estates", estateRoutes)
app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
	console.log(`Server is running on port: ${PORT}`)
	connectDB()
})
