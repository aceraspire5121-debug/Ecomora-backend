import { Order } from "../models/orderModel.js"
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";

export const dashboardData=async (req,res)=>{
try {
    
    const [totalOrders,totalUsers,recentOrders,lowStock,lowStockCount,recentUsers]=await Promise.all([
         Order.countDocuments(),
         User.countDocuments(),
         Order.find().sort({createdAt:-1}).limit(5).populate("user"),
         Product.find({stock:{$lt:5}}).limit(5),
         Product.countDocuments({stock:{$lt:5}}),
         User.find().sort({createdAt:-1}).limit(6),
         
    ])
    for (const user of recentUsers) {
        
    }
    res.status(200).json({success:true,totalOrders,totalUsers,recentOrders,lowStock,lowStockCount})

} catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
}
}