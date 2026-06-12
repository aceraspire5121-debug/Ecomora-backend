import express from "express"
const router=express.Router()
import { registerUser,loginUser, getSingleUser } from "../controllers/userController.js"
import { verifyToken } from "../middleware/verifyToken.js"
router.post("/login",loginUser)
router.post("/register",registerUser)
router.get("/getSingleUser",verifyToken,getSingleUser)
export default router