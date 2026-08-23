import Order from "../models/orderModel.js";
import Product from "../models/product.js";
import Address from "../models/Address.js";
import { use } from "react";

//place order COD : /api/order/cod
export const placeOrderCOD = async (req,res)=>{
try{
  const {user_id,items,address} = req.body;
    if(!address || !items || items.length === 0){
        return res.json({message: "Please provide all the required fields"});
    }
    //if data all are provided we need to calculate the amount of the order
    let amount = await items.reduce(async (acc, item)=> {
        const product = await Product.findById(item.product);
        return (await acc) + (product.offerPrice * item.quantity);
    },0 //this 0 is the initial value of the accumulator 
);  

// Add tax charge
amount += amount * 0.18; // Assuming a tax rate of 18%
// Create a new order with the provided details and calculated amount
const order = new Order({
    user_id,
    items,
    address,
    amount,
    paymentType: "COD",
    isPaid: false, // COD orders are not paid at the time of placement
});
await order.save();
}
catch(error){
    console.error("Error placing order:", error);
    res.status(500).json({message: "Internal Server Error"});
}
}

//get oders by userid : /api/order/user 
export const getUserOrders = async (req,res)=>{
    try{

        const {userId} = req.body;
        const orders = await Order.find({
            user_id: userId,
            $or: [
                {paymentType: 'COD'},
                {isPaid: true},
            ] // This condition ensures that we fetch orders that are either COD or have been paid for, providing a comprehensive view of the user's order history
        }).populate('items.product') // Populate the product details in the items array
        .populate('address'); // Populate the address details in the order
        res.json({success:true, orders}); // Send the fetched orders as a JSON response

    }catch(error){
        console.error("Error fetching user orders:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

//Get all orders for admin : /api/order/seller 
export const getAllOrders = async (req,res)=>{
    try{
        const orders = await Order.find().populate('items.product').populate('address');
        res.json({success:true, orders});
    }catch(error){
        console.error("Error fetching all orders:", error);
        res.status(500).json({message: "Internal Server Error"});
    }       
}