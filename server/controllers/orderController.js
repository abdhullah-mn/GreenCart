import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

//place order COD : /api/order/cod
export const placeOrderCOD = async (req,res)=>{
try{
    const {items,address} = req.body;
    if(!address || !items || items.length === 0){
        return res.json({message: "Please provide all the required fields"});
    }
    //if data all are provided we need to calculate the amount of the order
    let amount = await items.reduce(async (acc, item)=> {
        const product = await Product.findById(item.product);
        if (!product || !product.inStock) {
            throw new Error("One or more products are unavailable");
        }
        return (await acc) + (product.offerPrice * item.quantity);
    },0 //this 0 is the initial value of the accumulator 
);  

// Add tax charge
amount += amount * 0.18; // Assuming a tax rate of 18%
// Create a new order with the provided details and calculated amount
const order = new Order({
    user_id: req.userId,
    items,
    address,
    amount,
    paymentType: "COD",
    isPaid: false, // COD orders are not paid at the time of placement
});
await order.save();
res.status(201).json({success: true, order});
}
catch(error){
    console.error("Error placing order:", error);
    res.status(400).json({success: false, message: error.message});
}
}

//get oders by userid : /api/order/user 
export const getUserOrders = async (req,res)=>{
    try{

        const orders = await Order.find({
            user_id: req.userId,
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

export const getOrderById = async (req, res) => {
    try {
        const query = req.userId ? {_id: req.params.id, user_id: req.userId} : {_id: req.params.id};
        const order = await Order.findOne(query).populate('items.product').populate('address');
        if (!order) return res.status(404).json({success: false, message: "Order not found"});
        res.json({success: true, order});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({success: false, message: "Invalid order status"});
        }
        const order = await Order.findByIdAndUpdate(req.params.id, {status: req.body.status}, {new: true});
        if (!order) return res.status(404).json({success: false, message: "Order not found"});
        res.json({success: true, order});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
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