import mongoose from "mongoose";
const orderItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    name:{type:String,required:true},
    price:{type:Number,required:true},
    quantity:{type:Number,required:true},
    image:{type:String,required:true}    

})

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items:{type:[orderItemSchema],required:true},
    amount:{type:Number,required:true},
    orderId:{type:String,required:true,unique:true},
    paymentId:{type:String},
    status:{type:String,enum:["pending","paid","failed"],default:"pending"}, // enum means allowed values ki list
    paidAt:{type:Date},
},{timestamps:true}
)

export const Order=mongoose.model("Order",orderSchema)