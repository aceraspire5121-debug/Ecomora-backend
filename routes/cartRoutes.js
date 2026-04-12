import express from "express"
const router=express.Router()
import { addToCart, deleteFromCart, getProductsFromCart } from "../controllers/cartController.js";
import { manageQuantity } from "../controllers/cartController.js";
import { verifyToken } from "../middleware/verifyToken.js";
router.get("/products",verifyToken,getProductsFromCart) // static routes upar rakho barna bo /products ko neeche bale get me "/:id" smjkar id=products kar dega jo ki problem karega bahut
router.post("/:id",verifyToken,addToCart)
router.put("/:id",verifyToken,manageQuantity)
router.delete("/:id",verifyToken,deleteFromCart)

export default router;