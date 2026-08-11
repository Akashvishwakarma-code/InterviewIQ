import jwt from "jsonwebtoken"

const genToken = async (userId)=>{
    try{
         const Token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"});
         return Token
    }catch(error){
        console.log("error while Token:",error);
    }
   
}

export default genToken 