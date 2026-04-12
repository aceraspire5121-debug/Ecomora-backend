import { User } from "../models/userModel.js"
import { Product } from "../models/productModel.js"
import { Cart } from "../models/CartModel.js"
export const addToCart = async (req, res) => {
    try {
        const id = req.user.id // token banate time hamne id:UserExist._id kia tha isliye yaha par seedha id likh skte hai bina _id likhe,
        console.log(id)
        const productId = req.params.id // kyoki route me "/:id" likhne par ab ye params object ke andar available hai isliye req.params.id
        console.log(productId)
        const quantity = req.body?.quantity || 1;
        console.log(quantity)
        const product = await Product.findById(productId)
        if (!product)
            return res.status(404).json({ success: false, message: "Product not found" })
        let cart = await Cart.findOne({ user: id })
        if (!cart) {
            cart = await Cart.create({ user: id, items: [{ product: productId, quantity: quantity }] })
            return res.status(201).json({
                success: true,
                message: "Cart created & product added",
                cart,
            });
        }
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity }) // cart.items is an array and we are using array method push so we dont need [{...}] here
        }
        await cart.save();
        res.status(200).json({ success: true, message: "Product added to cart", cart })
    } catch (err) {
        res.status(500).json({ message: "Server mar raha hai Error" })
    }
}

export const getProductsFromCart=async (req,res)=>{
    try {
        const id=req.user.id;
        const cart=await Cart.findOne({user:id}).populate("items.product") // populate actual data la deta hai, jaise hamara items.product ek productId deta hai par populate us productId ka data lakar de dega
           if(!cart)
            return res.status(404).json({success:false,message:"Cart of this user does not exist"}) // 404 :- resource not found
        res.status(200).json({success:true,cart})

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server Error"})
    }
}

export const manageQuantity=async (req,res)=>{
    try{
        const id=req.user.id;
        const productId=req.params.id;
        const product=await Product.findById(productId)
        if(!product)
            return res.status(404).json({success:false,message:"Product not found"}) // 404:-document not found
        const cart=await Cart.findOne({user:id})
        if(!cart)
            return res.status(404).json({success:false,message:"Cart not found"})
        const itemIndex=cart.items.findIndex((item)=>item.product.toString()===productId) // data cart me  hai to index bhi usi me dhundoge
        if(itemIndex>-1)
        {   
            if(req.body.manage) 
              cart.items[itemIndex].quantity+=1;
            else
            {  
                if(cart.items[itemIndex].quantity>1)
                  cart.items[itemIndex].quantity-=1;
                else
                   // await Cart.items.deleteOne(productId) // Cart is model and model are use to do direct database operations like Cart.deleteOne i.e you want to delete a particular cart then you will use model name but here you want to deelte a product inside the cart so you have to use cart which have the data of that particular cart and then save the changes
                cart.items.splice(itemIndex,1) // itemIndex position se delete karo aur 1 hi element delete karo
            }
        }
        await cart.save()
      const updateCart=await Cart.findOne({user:id}).populate("items.product");
      res.json({success:true,cart:updateCart})
    }catch(err)
    {
      console.error(err);
      res.status(500).json({message:"Server Error"})
    }
}

export const deleteFromCart=async (req,res)=>{
    try{
        const id=req.user.id;
        const productId=req.params.id;
        const cart=await Cart.findOne({user:id})
        if(!cart)
            return res.status(404).json({success:false,message:"Cart doesnot exist"})
        const index=cart.items.findIndex((item)=>item.product.toString()===productId);
        if(index>-1)
        {
            cart.items.splice(index,1); // is index par jao items array me aur 1 document delete kardo
        }
        else{
            return res.status(404).json({success:false,message:"Product does not exist"})
        }
        await cart.save();
        const updatedCart = await Cart.findOne({ user: id }).populate("items.product");
        return res.json({success:true,message:"Removed from cart successfully",cart:updatedCart})

    }catch(err)
   {
    console.error(err);
      res.status(500).json({message:"Server Error"})
   }
}