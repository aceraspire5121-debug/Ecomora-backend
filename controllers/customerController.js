import mongoose from "mongoose"
import { User } from "../models/userModel.js"
import { Order } from "../models/orderModel.js";

export const getSinglecustomer= async (req,res)=>{

    try {
        const id=req.params.userid
        const objectId = new mongoose.Types.ObjectId(id);// we will convert the string id into objectId to compare it with the user section of order document
         const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||5;
    const filter=req.query.filter;

    const skip=(page-1)*limit;

    const query={user:id}
   if(filter!=="all")
    query.status=filter

    const totalDocuments=await Order.countDocuments(query)

     const [stats]=await Order.aggregate([
      {
        $match:{user:objectId} // it will find all the orders of the user
      },
    
    //   $group is used when you want to aggregate documents into summary values such as:
    // count
    // sum
    // average
      {
    $group:{
      _id:null,
      totalorders:{$sum:1},//for every document in the group add 1 so in this way sum is equal to total documents
      paidorders:{
        $sum:{
          $cond:[
            {$eq:["$status","paid"]},
            1,
            0
          ]
        }
      },
      pendingorders:{
        $sum:{
          $cond:[
            {$eq:["$status","pending"]},
            1,
            0
          ]
        }
      },
      totalspent:{$sum:"$amount"}
    }
      }
     ])

        const [user]=await User.aggregate([ // aggregate array return karti hai
// destructuring se array ka first element user variable me aa gaya
// ab user[0] likhne ki zaroorat nahi
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(id) //jab mai match use kar raha hu to User collection me har ek document par match kar raaha hu jaha bhi _id match kar jayega meri id se bo mera document hoga isliye _id likhenge
                }
            },
            {
                $lookup:{    //maine jo user document dhunda hai ab us user document ka use karke mai orders dhund raha hu isliye matching condition hogi orders ki jaha par localfield meri user document ki _id hogi aur foreignfield order ka order.user bala mtlb user hoga jab bhi _id aur order.user match karega mujhe order mila
                    from:"orders",
                    localField:"_id", // jo user object mujhe mila hai uski field _id se match hona chahiye order.user
                    foreignField:"user",


                   // lookup pehle orders collection me un documents ko dhundta hai
// jahan order.user == current user ki _id ho.
// Is matching ke baad jo orders milte hain un par pipeline apply hoti hai.
//
// Pipeline flow:
// 1. match  -> sirf wahi orders rakho jinka status filter ke equal ho.
// 2. sort   -> remaining orders ko createdAt ke basis par newest first sort karo.
// 3. skip   -> pagination ke liye initial documents skip karo.
// 4. limit  -> required number of documents hi return karo.
//
// Conceptually pipeline matched orders par chalti hai aur har stage
// previous stage ke output documents par kaam karti hai.

                    pipeline:[
                        {
                            $match:filter!=="all"?{status:filter}:{}
                        },
                       { $sort:{createdAt:-1}},
                       {$skip:skip},
                       {$limit:limit}
                    ],
                    as:"userorders"
                }
            }
        ])
        res.status(200).json({success:true,user,totalDocuments,stats})
    } catch (error) {
        res.status(500).json({success:false,error:error.message})
    }

}

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
            // localField:"_id", // current collection me jodega User._id
            // foreignField:"user", // doosri collection jo orders di hai uska Order me convert karke Order.user ko check karega
            let:{userid:"$_id"},
            pipeline:[
             {
                $match:{
                    status:"paid",
                    $expr:{
                        $eq:["$user","$$userid"] // order.user==user._id
                    }
                }
             }
            ],
            as:"userOrders" //is field ke name se add karega jab bhi User._id==Order.user ke
        }},
        {
            $addFields:{
                totalOrders:{$size:"$userOrders"}, // $ use hota hai field access karne ke liye
                totalSpent:{$sum:"$userOrders.amount"},
                lastActivity:{$max:"$userOrders.createdAt"}, // maximum nikalne ka mtlb bo order choose karo jiski date sabse badi ho i.e latest date bale order ko choose karo
                status:{
                    $cond:[
                        {$eq:["$isVerified",true]}, // $ lagate hai ham field accesss karne ke liye
                        "Active",
                        "Inactive"
                    ]
                }
            }
        },
        {
            $addFields:{
                avgOrder:{
                    $cond:[
                        {$gt:["$totalOrders",0]},
                        {$divide:["$totalSpent","$totalOrders"]},
                        0 // agar totalOrders 0 hue to 0 kar dega avgOrder ki value
                    ]
                }
            }
        },
         // 4️⃣ Handle users with no orders
         {
            $addFields:{
                totalSpent:{$ifNull:["$totalSpent",0]},
                lastActivity:{$ifNull:["$lastActivity","$createdAt"]}, // agar koi order nhi hai to lastActivity ko user.createdAt kardo
                avgOrder:{$ifNull:["$avgOrder",0]}
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
    const totalcustomers=await User.countDocuments(match) // match khud ek object hai 
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
            let:{userid:"$_id"}, // let variable declare karne ke liye use hota hai, userid ek variable hai, $_id kah raha hai ki current user ki _id ko lelo
           // kyoki mujhe additional filtering chahiye to uske liye orders collection ke andar aggregation use karunga
           pipeline:[ // nested aggregation ke liye pipeline likhna padta hai tabhi additional filtering kar skte ho
            {
                $match:{
                    status:"paid",
                    $expr:{
                        $eq:["$user","$$userid"] // order.user==user._id
                    }
                }
            }
           ],
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