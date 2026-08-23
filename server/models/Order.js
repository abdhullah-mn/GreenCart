import mongoose from 'mongoose';
import User from './user';

const orderSchema = new mongoose.Schema({

    user_id:{
        type: String, 
        required:true,
        ref: 'User'

    },
    items:[{
        product: {type:String, required:true,ref:'Product'},
        quantity: {type: Number, required: true}
    }],
    amount: {type: Number, required: true},
    address: {type: String, required: true, ref: 'Address'},
    status: {type: String, default: 'Order Placed'},
    paymentType: {type: String, required: true},
    isPaid: {type: Boolean, default: false},
},{timestamps: true});  // Add timestamps to automatically manage createdAt and updatedAt fields

const Order = mongoose.model.order || mongoose.model('Order', orderSchema);

export default Order;