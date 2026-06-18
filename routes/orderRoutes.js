import express from "express"
import { verifyToken } from "../middleware/verifyToken.js";
import { getAllOrder, getOrder } from "../controllers/paymentController.js";
import { isadmin } from "../middleware/isadmin.js";
const router=express.Router();
router.get("/getOrders",verifyToken,getAllOrder) // always put constant bala uper and params bala neeche
router.get("/:id",verifyToken,getOrder)
export default router;