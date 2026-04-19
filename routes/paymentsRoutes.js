import express from "express";
import { orderCreate, verifyPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router=express.Router()
router.post("/create",verifyToken,orderCreate)
router.post("/verify-payment",verifyToken,verifyPayment)

export default router;