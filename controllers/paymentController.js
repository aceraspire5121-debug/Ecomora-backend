import { Cart } from "../models/CartModel.js";
import Razorpay from "razorpay"
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";

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
                image:pro.images?.[0]||""
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