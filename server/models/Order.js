import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({

    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'

    },
    items:[{
        product: {type: mongoose.Schema.Types.ObjectId, required:true,ref:'Product'},
        quantity: {type: Number, required: true}
    }],
    amount: {type: Number, required: true},
    address: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Address'},
    status: {type: String, default: 'Order Placed'},
    paymentType: {type: String, required: true},
    isPaid: {type: Boolean, default: false},
},{timestamps: true});  // Add timestamps to automatically manage createdAt and updatedAt fields

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;