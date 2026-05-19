import express from "express"
import { addProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from "../controllers/productController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isadmin } from "../middleware/isadmin.js";
import upload from "../middleware/multer.js";
const router=express.Router()
router.post("/addProducts",verifyToken,isadmin,upload.array("images",4),addProduct)
router.get("/getProducts",getProducts)
router.get("/:id",getSingleProduct)
router.put("/:id",verifyToken,isadmin,upload.array("images",4),updateProduct)
router.delete("/:id",verifyToken,isadmin,deleteProduct) // jo "/:id" ye likha hai iski bajha se hi tum ab req.params.id karke nikal skte ho id

export default router;