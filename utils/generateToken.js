import jwt from "jsonwebtoken"
export const generateEmailToken=(userId)=>{
  return jwt.sign({userId,purpose:"verify"},process.env.JWT_SECRET,{expiresIn:"15m"})
}