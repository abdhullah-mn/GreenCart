import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({

    userId : {type:mongoose.Schema.Types.ObjectId, required:true, ref: 'User'},
    firstName: { type: String, required: true },
    lastName: {type:String, required: true},
    email:{type:String, required:true},
    city:{type:String, required:true},
    state:{type:String, required:true},
    postalCode:{type:String, required:true},
    country:{type:String, required:true},
    phoneNumber:{type:String, required:true}

})

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address; // Export the Address model for use in other parts of the application.