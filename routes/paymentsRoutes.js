import express from "express";
import { orderCreate } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router=express.Router()
router.post("/create",verifyToken,orderCreate)

export default router;