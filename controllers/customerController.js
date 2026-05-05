import { User } from "../models/userModel.js"

export const getAllCustomers=async (req,res)=>{
  try {
    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||5;
    const status=req.query.status
    const tier=req.query.tier
    const skip=(page-1)*limit;
    let match={role:"user"}
    if(status && status!="All")
    status=="Active"?match.isVerified=true:match.isVerified=false
    if(tier && tier!="All")
    match.tier=tier
    const customers=await User.aggregate([
        {$match:match}, // first pipeline
        {$lookup:{
            from:"orders", // kaha se data lana hai, orders collection se lana hai
            localField:"_id", // current collection me jodega User._id
            foreignField:"user", // doosri collection jo orders di hai uska Order me convert karke Order.user ko check karega
            as:"userOrders" //is field ke name se add karega jab bhi User._id==Order.user ke
        }},
        {
            $addFields:{
                totalOrders:{$size:"$userOrders"}, // $ use hota hai field access karne ke liye
                totalSpent:{$sum:"$userOrders.amount"},
                lastActivity:{$max:"$userOrders.createdAt"},
                status:{
                    $cond:[
                        {$eq:["$isVerified",true]}, // $ lagate hai ham field accesss karne ke liye
                        "Active",
                        "Inactive"
                    ]
                }
            }
        },
         // 4️⃣ Handle users with no orders
         {
            $addFields:{
                totalSpent:{$ifNull:["$totalSpent",0]},
                lastActivity:{$ifNull:["$lastActivity","$createdAt"]}
            }
         },
         {
            $project:{
                password:0,
                userOrders:0,
                __v:0
            }
         },
         {
            $sort:{createdAt:-1}
         },
         {
            $skip:skip
         },
         {
            $limit:limit
         }

    ])
    const totalcustomers=await User.countDocuments({role:"user"})
    const totalActive=await User.countDocuments({role:"user",isVerified:true});
    const now = new Date();

const newThisMonth = await User.countDocuments({
  role: "user",
  createdAt: {
    $gte: new Date(now.getFullYear(), now.getMonth(), 1) // 1 month year se baad ke created users dedo
  }
});

const avgOrder=await User.aggregate([
    {$match:{role:"user"}},
    {
        $lookup:{
            from:"orders",
            localField:"_id",
            foreignField:"user",
            as:"userOrders"
        }
    },
    {
        $addFields:{
            totalOrder:{$size:"$userOrders"},
            totalamount:{$sum:"$userOrders.amount"}
        }
    },
    {
        $group:{
            _id:null,
            totalOrder:{$sum:"$totalOrder"} ,// per user jo orders aaye un sab ka sum kar lia
            totalamount:{$sum:"$totalamount"}
        }
    }
])
    res.json({success:true,customers,totalcustomers,totalActive,newThisMonth,avgOrder})
  } catch (error) {
    res.status(500).json({success:false,message:error.message})
  }
}