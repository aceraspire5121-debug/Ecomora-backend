import express from "express"
const router=express.Router()
import { registerUser,loginUser } from "../controllers/userController.js"
router.post("/login",loginUser)
router.post("/register",registerUser)
export default router