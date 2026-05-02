import mongoose from 'mongoose';


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: Array,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    image:{
        type: Array,
        required: true
    },
    category:{
        type: Array,
        required:true
    },
    inStock: {
        type: boolean,
        default: true
    }


},{minimize: false, timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;