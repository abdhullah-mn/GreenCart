import Address from "../models/Address.js";

//Add address : /api/address/add
export const addAddress = async (req,res)=>{
    try{

        const {address} = req.body;
        await Address.create({...address, userId: req.userId});
        res.json({success:true, message: "Address added successfully"}); // Send a success response

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: "Failed to add address"}); // Send an error response

    }
}

//Get Address : /api/address/get

export const getAddress = async (req,re)=>{
    try{

        const addresses = await Address.find({userId: req.userId});
        res.json({success:true, addresses}); // Send the fetched addresses as a JSON response

    }catch(error){
        console.log(error.message);
        res.json({success: false, message: "Failed to get addresses"}); // Send an error response
    }
}