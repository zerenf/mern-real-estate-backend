import { Router } from "express"
import { createEstate, deleteEstate, getAllEstates, getSingleEstate, updateEstate } from "../controllers/estateControllers.js"

import uploadMiddleware from "../middlewares/MulterMiddlewares.js"

const router = Router()

router.get("/", getAllEstates)

router.get("/estate/:id", getSingleEstate)

router.post("/create-estate", uploadMiddleware.array("images"), createEstate)

router.put("/update-estate/:id", uploadMiddleware.array("images"), updateEstate)

router.delete("/delete-estate/:id", deleteEstate)

export default router
