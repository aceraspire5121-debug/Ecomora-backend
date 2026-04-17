import express from "express";
import { objectCreate } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router=express.Router()
router.post("/create",verifyToken,objectCreate)

export default router;