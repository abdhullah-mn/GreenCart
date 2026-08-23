import User from '../models/User.js';



//update user cart data : /api/user/update
export const updateCart = async(req,res)=>{
    try{

        const {userId, cartItems} = req.body;
        await User.findByIdAndUpdate(userId, {cartItems: cartItems}); // Update the cartItems field of the user with the specified userId in the database
        res.json({ success: true, message: "Cart updated successfully" }); // Send a success response

    }catch(error){
        console.log(error);
        res.json({ success: false, message: "Failed to update cart" }); // Send an error response   

    }
}