// import { User } from "../models/userModel.js"

// export const getAllCustomers=async (req,res)=>{
//   try {
//     const page=parseInt(req.query.page)||1;
//     const limit=parseInt(req.query.limit)||5;
//     const status=req.query.status
//     const tier=req.query.tier
//     const skip=(page-1)*limit;
//     let match={role:"user"}
//     if(status && status!="All")
//     status=="Active"?match.isVerified=true:match.isVerified=false
//     if(tier && tier!="All")
//     match.tier=tier
//     const customers=await User.aggregate([
//         {$match:match}, // first pipeline
//         {$lookup:{
//             from:"orders", // kaha se data lana hai, orders collection se lana hai
//             // localField:"_id", // current collection me jodega User._id
//             // foreignField:"user", // doosri collection jo orders di hai uska Order me convert karke Order.user ko check karega
//             let:{userid:"$_id"},
//             pipeline:[
//              {
//                 $match:{
//                     status:"paid",
//                     $expr:{
//                         $eq:["$user","$$userid"] // order.user==user._id
//                     }
//                 }
//              }
//             ],
//             as:"userOrders" //is field ke name se add karega jab bhi User._id==Order.user ke
//         }},
//         {
//             $addFields:{
//                 totalOrders:{$size:"$userOrders"}, // $ use hota hai field access karne ke liye
//                 totalSpent:{$sum:"$userOrders.amount"},
//                 lastActivity:{$max:"$userOrders.createdAt"}, // maximum nikalne ka mtlb bo order choose karo jiski date sabse badi ho i.e latest date bale order ko choose karo
//                 status:{
//                     $cond:[
//                         {$eq:["$isVerified",true]}, // $ lagate hai ham field accesss karne ke liye
//                         "Active",
//                         "Inactive"
//                     ]
//                 }
//             }
//         },
//         {
//             $addFields:{
//                 avgOrder:{
//                     $cond:[
//                         {$gt:["$totalOrders",0]},
//                         {$divide:["$totalSpent","$totalOrders"]},
//                         0 // agar totalOrders 0 hue to 0 kar dega avgOrder ki value
//                     ]
//                 }
//             }
//         },
//          // 4️⃣ Handle users with no orders
//          {
//             $addFields:{
//                 totalSpent:{$ifNull:["$totalSpent",0]},
//                 lastActivity:{$ifNull:["$lastActivity","$createdAt"]}, // agar koi order nhi hai to lastActivity ko user.createdAt kardo
//                 avgOrder:{$ifNull:["$avgOrder",0]}
//             }
//          },
//          {
//             $project:{
//                 password:0,
//                 userOrders:0,
//                 __v:0
//             }
//          },
//          {
//             $sort:{createdAt:-1}
//          },
//          {
//             $skip:skip
//          },
//          {
//             $limit:limit
//          }

//     ])
//     const totalcustomers=await User.countDocuments(match) // match khud ek object hai 
//     const totalActive=await User.countDocuments({role:"user",isVerified:true});
//     const now = new Date();

// const newThisMonth = await User.countDocuments({
//   role: "user",
//   createdAt: {
//     $gte: new Date(now.getFullYear(), now.getMonth(), 1) // 1 month year se baad ke created users dedo
//   }
// });

// const avgOrder=await User.aggregate([
//     {$match:{role:"user"}},
//     {
//         $lookup:{
//             from:"orders",
//             let:{userid:"$_id"}, // let variable declare karne ke liye use hota hai, userid ek variable hai, $_id kah raha hai ki current user ki _id ko lelo
//            // kyoki mujhe additional filtering chahiye to uske liye orders collection ke andar aggregation use karunga
//            pipeline:[ // nested aggregation ke liye pipeline likhna padta hai tabhi additional filtering kar skte ho
//             {
//                 $match:{
//                     status:"paid",
//                     $expr:{
//                         $eq:["$user","$$userid"] // order.user==user._id
//                     }
//                 }
//             }
//            ],
//             as:"userOrders"
//         }
//     },
//     {
//         $addFields:{
//             totalOrder:{$size:"$userOrders"},
//             totalamount:{$sum:"$userOrders.amount"}
//         }
//     },
//     {
//         $group:{
//             _id:null,
//             totalOrder:{$sum:"$totalOrder"} ,// per user jo orders aaye un sab ka sum kar lia
//             totalamount:{$sum:"$totalamount"}
//         }
//     }
// ])
//     res.json({success:true,customers,totalcustomers,totalActive,newThisMonth,avgOrder})
//   } catch (error) {
//     res.status(500).json({success:false,message:error.message})
//   }
// }