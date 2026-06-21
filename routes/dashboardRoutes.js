import express from "express"
import { verifyToken } from "../middleware/verifyToken.js";
import { isadmin } from "../middleware/isadmin.js";
import { dashboardData } from "../controllers/dashboardController.js";
const router=express.Router()
router.get("/fetchData",verifyToken,isadmin,dashboardData)
export default router;