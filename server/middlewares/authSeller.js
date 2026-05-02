import jwt from 'jsonwebtoken';


const authSeller = async(req,res,next)=>{
    const sellerToken = req.cookies.token;

    if(!sellerToken){
        return res.status(401).json({message: "Unauthorized Seller"});
    }

    
    try{
        const decoded = JsonWebTokenError.verify(sellerToken, process.env.JWT_SECRET);
        if(decoded.email === process.env.SELLER_EMAIL){
            next();
        }
        else{
            return res.json({message:"Not authorized"});
        }
    } catch (error) {
        return res.json({message: "Invalid token"});

    }
}

export default authSeller;