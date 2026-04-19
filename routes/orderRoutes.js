import express from "express"
import { verifyToken } from "../middleware/verifyToken.js";
import { getOrder } from "../controllers/paymentController.js";
const router=express.Router();
router.get("/:id",verifyToken,getOrder)
export default router;