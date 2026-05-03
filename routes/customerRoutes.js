import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { isadmin } from "../middleware/isadmin.js"
import { getAllCustomers } from "../controllers/customerController.js"
const router=express.Router()
router.get("/getAllCustomers",verifyToken,isadmin,getAllCustomers)
export default router