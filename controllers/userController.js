
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
        const url=`${process.env.BASE_URL}/api/email/verify/${token}`;
        await sendEmail({
    to:userExist.email,
    subject:"Verify your Email",
   html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table align="center" width="100%" style="max-width:600px; background:white; margin-top:40px; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
      
      <tr>
        <td style="background:#0d6efd; padding:20px; text-align:center; color:white;">
          <h1 style="margin:0;">Ecomora 🚀</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:30px; text-align:center;">
          <h2 style="margin-bottom:10px;">Welcome to Ecomora</h2>
          <p style="color:#555; font-size:16px;">
            Please verify your email to activate your account.
          </p>

          <a href="${url}" 
             style="
               display:inline-block;
               margin-top:20px;
               padding:12px 25px;
               background:#0d6efd;
               color:white;
               text-decoration:none;
               border-radius:5px;
               font-size:16px;
               font-weight:bold;
             ">
             Verify Email
          </a>

          <p style="margin-top:25px; font-size:14px; color:#888;">
            If the button doesn't work, copy and paste this link:
          </p>

          <p style="word-break:break-all; color:#0d6efd;">
            ${url}
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#888;">
          © 2026 Ecomora. All rights reserved.
        </td>
      </tr>

    </table>

  </body>
</html>
`
})
return res.json({success:true,message:"Verification email resent"})
    }
 }
const hashedPassword=await bcrypt.hash(password,10)
const newUser=await User.create({name,email,phoneNumber,password:hashedPassword})
const token=generateEmailToken(newUser._id)
const url=`${process.env.BASE_URL}/api/email/verify/${token}`;
console.log(email)
await sendEmail({
    to:email,
    subject:"Verify your Email",
   html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table align="center" width="100%" style="max-width:600px; background:white; margin-top:40px; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
      
      <tr>
        <td style="background:#0d6efd; padding:20px; text-align:center; color:white;">
          <h1 style="margin:0;">Ecomora 🚀</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:30px; text-align:center;">
          <h2 style="margin-bottom:10px;">Welcome to Ecomora</h2>
          <p style="color:#555; font-size:16px;">
            Please verify your email to activate your account.
          </p>

          <a href="${url}" 
             style="
               display:inline-block;
               margin-top:20px;
               padding:12px 25px;
               background:#0d6efd;
               color:white;
               text-decoration:none;
               border-radius:5px;
               font-size:16px;
               font-weight:bold;
             ">
             Verify Email
          </a>

          <p style="margin-top:25px; font-size:14px; color:#888;">
            If the button doesn't work, copy and paste this link:
          </p>

          <p style="word-break:break-all; color:#0d6efd;">
            ${url}
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#888;">
          © 2026 Ecomora. All rights reserved.
        </td>
      </tr>

    </table>

  </body>
</html>
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

export const checkemail=async (req,res)=>{
  try{
 const email=req.body.email;
  const userExist=await User.findOne({email});
if (!userExist) {
  return res.status(200).json({
    success: true,
    message: "If an account exists, a reset link has been sent" // attackers ko nhi bata skte ki email exist nhi karti site vulnerable ho skti hai
  });
}

const token=generateEmailToken(userExist._id)
const url=`${process.env.FRONTEND_URL}/reset-password/${token}`
await sendEmail({
    to:email,
    subject:"Reset your password",
   html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    
    <table align="center" width="100%" style="max-width:600px; background:white; margin-top:40px; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
      
      <tr>
        <td style="background:#0d6efd; padding:20px; text-align:center; color:white;">
          <h1 style="margin:0;">Ecomora 🚀</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:30px; text-align:center;">
          <h2 style="margin-bottom:10px;">Welcome to Ecomora</h2>
          <p style="color:#555; font-size:16px;">
            Please reset your password to sign in
          </p>

          <a href="${url}" 
             style="
               display:inline-block;
               margin-top:20px;
               padding:12px 25px;
               background:#0d6efd;
               color:white;
               text-decoration:none;
               border-radius:5px;
               font-size:16px;
               font-weight:bold;
             ">
             Reset Password
          </a>

          <p style="margin-top:25px; font-size:14px; color:#888;">
            If the button doesn't work, copy and paste this link:
          </p>

          <p style="word-break:break-all; color:#0d6efd;">
            ${url}
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#888;">
          © 2026 Ecomora. All rights reserved.
        </td>
      </tr>

    </table>

  </body>
</html>
`
})

res.status(200).json({success:true,message:"If an account exists, a reset link has been sent"})

  }catch(err)
  {
 res.status(500).json({success:false,message:err.message})
  }
}