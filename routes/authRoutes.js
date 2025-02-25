import { register, login, getProfile } from "../controllers/authController.js"
import { auth } from "../middlewares/AuthMiddleware.js"

import { Router } from "express"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", auth, getProfile)

export default router
