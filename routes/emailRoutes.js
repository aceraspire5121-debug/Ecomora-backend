import express from "express"
const router=express.Router()
import { checkemail, sendverificationemail, updatePassword, verifyEmail } from "../controllers/userController.js";
router.get("/verify/:token",verifyEmail)
router.post("/checkemail",checkemail)
router.post("/sendverficationemail",sendverificationemail)
router.post("/:token",updatePassword)
export default router;