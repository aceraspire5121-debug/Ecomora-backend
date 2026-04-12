
import bcrypt from "bcrypt"
import jwt  from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { generateEmailToken } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
export const registerUser=async (req,res)=>{
    try{
 const {name,email,phoneNumber,password}=req.body;
 if(!name || !email || !phoneNumber || !password){
   return res.status(400).json({success:false,message:"All fields are required"})
}
 const userExist=await User.findOne({$or:[{email},{phoneNumber}]})
 if(userExist)
 {
    if(userExist.isVerified===true)
      return res.status(400).json({success:false,message:"User already exist"})
    else{
         const hashedPassword = await bcrypt.hash(password, 10);
        userExist.password=hashedPassword;
        userExist.name=name;
         await userExist.save() 
        const token=generateEmailToken(userExist._id)
        const url=`http://localhost:3000/api/email/verify/${token}`;
        await sendEmail({
    to:userExist.email,
    subject:"Verify your Email",
    html: `
  <h2>Welcome to Ecomora 🚀</h2>
  <p>Click below to verify your email:</p>
  <a href="${url}">Verify Email</a>
`
})
return res.json({success:true,message:"Verification email resent"})
    }
 }
const hashedPassword=await bcrypt.hash(password,10)
const newUser=await User.create({name,email,phoneNumber,password:hashedPassword})
const token=generateEmailToken(newUser._id)
const url=`http://localhost:3000/api/email/verify/${token}`;
console.log(email)
await sendEmail({
    to:email,
    subject:"Verify your Email",
    html: `
  <h2>Welcome to Ecomora 🚀</h2>
  <p>Click below to verify your email:</p>
  <a href="${url}">Verify Email</a>
`
})

newUser.password=undefined
res.status(201).json({success:true,message:"Account successfully created",newUser})
    }catch(error)
    {
        res.status(500).json({success:false,message:error.message})
    }
}
export const loginUser=async (req,res)=>{
    try{
 const {email,password}=req.body;
 if(!email || !password)
   return res.status(400).json({success:false,message:"All fields are required"})
const userExist=await User.findOne({email})
if(!userExist)
   return res.status(400).json({success:false,message:"No Account found"})
if(userExist.isVerified===false)
    return res.status(401).json({success:false,message:"Please verify your email first"})
const checkedPassword=await bcrypt.compare(password,userExist.password)
if(!checkedPassword)
  return res.status(400).json({success:false,message:"Password is incorrect"})
const token=jwt.sign({id:userExist._id,role:userExist.role},process.env.JWT_SECRET,{expiresIn:"1d"})
res.status(200).json({success:true,token,user:{
      id:userExist._id,
      name:userExist.name,
      email:userExist.email,
      role:userExist.role
   }})
    }catch(error)
    {
        res.status(500).json({success:false,message:error.message})
    }
}

export const verifyEmail=async (req,res)=>{
    try{
const token=req.params.token;
const decoded=jwt.verify(token,process.env.JWT_SECRET);
 if (decoded.purpose !== "verify") {
      return res.json({ success: false, message: "Invalid token" });
    }
const user=await User.findById(decoded.userId)
if(!user)
{
    return res.json({success:false,message:"User does not exist"})
}
if(user.isVerified)
    return res.json({message:"user already verified"})
user.isVerified=true;
await user.save();
return res.send("user verified successfully")
    }catch(err)
    {
        console.log(err);
       return res.json({ success: false, message:"Verification link expired. Please register again to receive a new verification email." });
    }
}