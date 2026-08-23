import jwt from 'jsonwebtoken';


const authSeller = async(req,res,next)=>{
    const sellerToken = req.cookies.sellerToken;

    if(!sellerToken){
        return res.status(401).json({success: false, message: "Unauthorized Seller"});
    }

    
    try{
        const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if(decoded.email === process.env.SELLER_EMAIL){
            next();
        }
        else{
            return res.status(403).json({success: false, message:"Not authorized"});
        }
    } catch (error) {
        return res.status(401).json({success: false, message: "Invalid token"});

    }
}

export default authSeller;