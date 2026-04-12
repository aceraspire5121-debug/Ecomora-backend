export const isadmin=(req,res,next)=>{
if(req.user.role==="admin")
    next();
else
    return res.status(403).json({message:"only Admins are allowed"})
}

//401:- unauthorised
//403:-forbidden(authorised but dont have permission)