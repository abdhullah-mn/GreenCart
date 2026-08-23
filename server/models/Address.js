import mongoose from 'mongoose';
import Product from '../models/product.js';
import User from '../models/user.js';

const addressSchema = new mongoose.Schema({

    userId : {type:String, required:true},
    firstName: { type: String, required: true },
    lastName: {type:String, required: true},
    email:{type:String, required:true},
    city:{type:String, required:true},
    state:{type:String, required:true},
    postalCode:{type:String, required:true},
    country:{type:String, required:true},
    phoneNumber:{type:String, required:true}

})

const Address = mongoose.model.Address || mongoose.model('Address', addressSchema); // Create the Address model using the defined schema. If the model already exists, use the existing one.

export default Address; // Export the Address model for use in other parts of the application.