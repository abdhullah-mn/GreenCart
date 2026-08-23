import User from '../models/user.js';



//update user cart data : /api/user/update
export const updateCart = async(req,res)=>{
    try{

        const {cartItems} = req.body;
        if (!Array.isArray(cartItems)) {
            return res.status(400).json({success: false, message: "cartItems must be an array"});
        }
        await User.findByIdAndUpdate(req.userId, {cartItems});
        res.json({success: true, message: "Cart updated successfully"});

    }catch(error){
        console.log(error);
        res.json({ success: false, message: "Failed to update cart" }); // Send an error response   

    }
}

export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('cartItems');
        if (!user) return res.status(404).json({success: false, message: "User not found"});
        res.json({success: true, cartItems: user.cartItems});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};