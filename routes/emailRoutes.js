import express from "express"
const router=express.Router()
import { checkemail, updatePassword, verifyEmail } from "../controllers/userController.js";
router.get("/verify/:token",verifyEmail)
router.post("/checkemail",checkemail)
router.post("/:token",updatePassword)
export default router;