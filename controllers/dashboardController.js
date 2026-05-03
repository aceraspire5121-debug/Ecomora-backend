import { Order } from "../models/orderModel.js"
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";

export const dashboardData=async (req,res)=>{
try {
    
    const [totalOrders,totalUsers,recentOrders,lowStock,lowStockCount,recentUsers]=await Promise.all([
         Order.countDocuments(),
         User.countDocuments({role:"user"}),
         Order.find().sort({createdAt:-1}).limit(5).populate("user"),
         Product.find({stock:{$lt:5}}).limit(5),
         Product.countDocuments({stock:{$lt:5}}),
         User.find({role:"user"}).sort({createdAt:-1}).limit(6),
         
    ])
   const recent=await Promise.all(
    recentUsers.map(async (user)=>{ // async function returns a promise, and map returns the array so overall we get the array of promises hence we wait for resolving it
     const orders=await Order.find({user:user._id})
     return {
        user:user,
        order:orders,
        count:orders.length,
        amount:orders.reduce((s,i)=>s+i.amount,0)
     }
    })
   )
    res.status(200).json({success:true,totalOrders,totalUsers,recentOrders,lowStock,lowStockCount,recent})

} catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
}
}