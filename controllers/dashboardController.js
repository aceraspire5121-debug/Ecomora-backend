import { Order } from "../models/orderModel.js"
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";

export const dashboardData=async (req,res)=>{
try {
    const sevendaysago=new Date()
    sevendaysago.setDate(sevendaysago.getDate()-7)
    
    
    const [totalOrders,totalUsers,recentOrders,lowStock,lowStockCount,recentUsers,usersthisweek,ordersthisweek,revenue]=await Promise.all([
         Order.countDocuments(),
         User.countDocuments({role:"user"}),
         Order.find({status:"paid"}).sort({createdAt:-1}).limit(5).populate("user"),
         Product.find({stock:{$lt:5}}).limit(5),
         Product.countDocuments({stock:{$lt:5}}),
         User.find({role:"user"}).sort({createdAt:-1}).limit(6),
         User.countDocuments({role:"user",createdAt:{$gt:sevendaysago}}),
         Order.countDocuments({status:"paid",createdAt:{$gt:sevendaysago}}),
         Order.aggregate([
          {
            $facet:{
                totalrevenue:[
                    {$match:{status:"paid"}},
                    {$group:{_id:null,amount:{$sum:"$amount"}}}
                ],
                weeklyrevenue:[
                    {$match:{status:"paid",createdAt:{$gt:sevendaysago}}},
                    {$group:{_id:null,amount:{$sum:"$amount"}}}
                ]
            }
          }
         ])
         
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
   console.log("revenue",revenue)
   const totalrevenue=revenue[0]?.totalrevenue[0]?.amount || 0
   const weeklyrevenue=revenue[0]?.weeklyrevenue[0]?.amount || 0
    res.status(200).json({success:true,totalOrders,totalUsers,recentOrders,lowStock,lowStockCount,recent,usersthisweek,ordersthisweek,totalrevenue,weeklyrevenue})

} catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
}
}