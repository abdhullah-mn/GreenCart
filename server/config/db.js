import mongoose from 'mongoose';

const connectDb = async ()=>{
    try{

        mongoose.connection.on("Connected", ()=>{
            console.log("MongoDB connected successfully");
        });
        await mongoose.connect( `${process.env.MONGODB_URI}/greencart` ); 

    }catch(error){
        console.error('Error connecting to MongoDB:', error);
    }
}

export default connectDb;