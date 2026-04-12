
import jwt from "jsonwebtoken"
export const verifyToken= (req,res,next)=>{
 const authHeader=req.headers.authorization
 if(!authHeader)
    return res.status(401).json({message:"No Token Provided"})
   const token=authHeader.split(" ")[1];
   if(!token)
    return res.status(401).json({message:"Invalid token format"})
try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    req.user=decoded;
    next()
}catch(error)
{
    res.status(401).json({message:error.message})
}
}

//we dont need to import express everywhere , only import express in server.js and routes because there we use function of express