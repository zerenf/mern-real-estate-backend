import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import path from "path"

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./public/uploads")
	},
	filename: (req, file, cb) => {
		cb(null, `${uuidv4()}_${path.extname(file.originalname)}`)
	},
})

const uploadMiddleware = multer({ storage })

export default uploadMiddleware
