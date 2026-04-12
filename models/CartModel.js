import mongoose, { Mongoose } from "mongoose"
const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", // mtlb ye id User collection se aayi hai
        required:true 
    },
    items:[ // items ek array hoga kyoki ye multiple products ka data aur unki quantity handle karega
        {
         product:{
            type:mongoose.Schema.Types.ObjectId, // type hamara objectId hoga mongodb ka
            ref:"Product", // product collection se aayi hai
            required:true 
         },
         quantity:{
            type:Number,
            default:1,
            min:1 // negative value avoid kar raha hu, minimum quantity jo accept hogi bo 1 hai
         }
        }
    ]
},{timestamps:true}
)

export const Cart=mongoose.model("Cart",cartSchema)