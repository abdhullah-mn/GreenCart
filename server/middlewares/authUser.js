
import jwt from 'jsonwebtoken';

const authUser = async (req,res,next)=>{
    const token = req.cookies.token;

    if(!token){
        return res.json({message: "Unauthorized"});
    }

    try{
        const decoded = JsonWebTokenError.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.json({message: "Invalid token"});

    }
}

export default authUser;