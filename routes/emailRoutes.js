import express from "express"
const router=express.Router()
import { checkemail, verifyEmail } from "../controllers/userController.js";
router.get("/verify/:token",verifyEmail)
router.post("/checkemail",checkemail)
export default router;