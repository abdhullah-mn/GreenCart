import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    offerPrice: {
        type: Number,
        required: true,
        min: 0
    },
    image:{
        type: Array,
        required: true
    },
    category:{
        type: String,
        required:true
    },
    inStock: {
        type: Boolean,
        default: true
    }


},{minimize: false, timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;