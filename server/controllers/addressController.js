import Address from "../models/Address.js";

//Add address : /api/address/add
export const addAddress = async (req,res)=>{
    try{

        const {address, userId} = req.body;
        await Address.create({...address, userId: userId}); // Create a new address document in the database with the provided address data and userId. 3 dots are used to spread the properties of the address object into the new document, and the userId is added as a separate field.
        res.json({success:true, message: "Address added successfully"}); // Send a success response

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: "Failed to add address"}); // Send an error response

    }
}

//Get Address : /api/address/get

export const getAddress = async (req,re)=>{
    try{

        const {userId} =  req.body;
        const addresses = await Address.find({userId: userId}); // Fetch all address documents from the database that match the specified userId
        res.json({success:true, addresses}); // Send the fetched addresses as a JSON response

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: "Failed to get addresses"}); // Send an error response
    }
}