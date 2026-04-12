import express from "express"
const router=express.Router()
import { verifyEmail } from "../controllers/userController.js";
router.get("/verify/:token",verifyEmail)
export default router;