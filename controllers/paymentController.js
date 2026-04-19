import { Cart } from "../models/CartModel.js";
import Razorpay from "razorpay"
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const orderCreate=async (req,res)=>{
    const id=req.user.id;
    try {
        const cart=await Cart.findOne({user:id}).populate("items.product")
     if (!cart || cart.items.length === 0) {
  return res.json({
    success: false,
    message: "Cart is empty",
  });
} 

    cart.items = cart.items.filter(p => p.product); // agar koi product database se delete kar dia , to bo error create kar dega isliye hamne ki agar product exist karta hai to dal do nhi hai to skip that
    await cart.save();

        if (cart.items.length === 0) { // sare product delete ho gye to return kar dunga kyoki agar product delete to filter par cart ho gaya empty isliye ye condition lagayi
      return res.json({
        success: false,
        message: "All items are unavailable",
      });
    }


     const total= cart.items.reduce((total,p)=>total+(p.product.price)*p.quantity,0)
     const deliveryfee=120;
     const finalAmount=total+deliveryfee

     const orderItems= cart.items.map((i)=>{
            const pro=i.product;
            return {
                product:pro._id,
                name:pro.name,
                price:pro.price,
                quantity:i.quantity,
                image: pro.images?.[0]?.url || ""  //images "{\n  url: 'https://res.cloudinary.com/dzrzk86mu/image/upload/v1775662731/products/1775662730427-iphone.jpg.jpg',\n  public_id: 'products/1775662730427-iphone.jpg',\n  _id: n
            }
        }
     ) 

    const options={ // ye razorpay server ko bol raha hai ki mera ek order bana do
        amount:finalAmount*100,
        currency:"INR",
        receipt: `ord_${Date.now()}` // yeh unique hoga har order ka
    }

    const order=await razorpay.orders.create(options)

    if(!order)
        return res.json({success:false,message:"Sorry but failed to create order"})

    const userOrder=await Order.create({user:id,items:[...orderItems],amount:finalAmount,orderId:order.id}) // razorpay ka order id hota hai order.id

     res.json({
        success:true,
         order_id: order.id,
       amount: order.amount,
      currency: order.currency,
     })

    } catch (error) {
        console.log("Error is ",error)
        return res.status(500).json({success:false,message:error.message})
    }
}

export const verifyPayment=async (req,res)=>{
    try {
        const id=req.user.id;

        const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id; // ek string banayi us format ka use karke jo razorpay karta hai signature banane ke liye

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body) // string ko as a input pass kar dia
      .digest("hex"); // final output nikal rahe ho

      if(expectedSignature!==razorpay_signature)
      {
        return res.status(400).json({success:false,message:"Invalid signature"})
      }
      const order=await Order.findOne({orderId:razorpay_order_id}) // kyoki agar user se dhundoge to user to kitne bhi order place kar skta hai aur sabhi orders me uski userid same rahegi to kaha par status update karna hai ye tumhe best orderId se hi pata lagega jo ki unique hoga
      if(!order)
      {
        return res.status(404).json({success:false,message:"Order not found"})
      }

          // 🔐 User match check 
    if (order.user.toString() !== id) { // validation that the order userid and the token userid same hai agar hai to sahi user hai barna unauthorised userhai
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

      order.status="paid"
      order.paymentId=razorpay_payment_id;
      order.paidAt=new Date()
      await order.save()

      await Cart.findOneAndUpdate({user:id},{$set:{items:[]}})

      res.json({
      success: true,
      message: "Payment verified successfully",
      order
    });
    
    } catch (error) {
        console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
    }

}

export const getOrder=async (req,res)=>{
   try {
    const orderid=req.params.id;
    const userid=req.user.id;
    const order=await Order.findOne({_id:orderid,user:userid})
    if(!order)
        return res.status(400).json({success:false,message:"Order does not exist"})
    res.status(200).json({success:true,message:"Order found",order})
   } catch (error) {
    return res.status(500).json({success:false,message:error.message})
   }
}