import jwt from 'jsonwebtoken';




//seller login: /api/seller/sellerLogin

export const sellerLogin = async(req,res)=>{
    try{
        const {email,password} = req.body;

    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){

        const token = jwt.sign({email},process.env.JWT_SECRET,{expiresIn: '7d'});
        
        res.cookie('sellerToken', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', //use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Adjust sameSite attribute based on environment, CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds, we should set the cookie expiration to match the token expiration for consistency
    });

    return res.json ({success: true, message: "Logged In"});
    }else{
        return res.json({success: true, message: "Invalid Credentials"});
    }
    }catch(error){
        console.log(error.message);
        res.json({success:true, message: error.message});
    }

}

//seller auth /api/seller/is-Auth


export const isAuth = async(req,res)=>{
    try{
        return res.json({success:true});
 
    }catch(error){

        console.log(error);
        return res.json({message: error.message});      

    }
}

//seller Logout /api/seller/logout
export const sellerLogout = async (req,res)=>{
    try{

    //clear the cookie that stires the jwt
    res.clearCookie("sellerToken",{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production'? 'none':'strict',

    });
    return res.json({success:true, message:"Seller Logged Out"});

    }catch(error){ 
        console.log(error);
        return res.json({message: error.message});
    }
}
