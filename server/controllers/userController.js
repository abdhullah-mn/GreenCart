import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


// POST /apiuser/register
export const registerUser = async (req,res)=>{
    try{
        const {name,email,password} = req.body;

        if(!name || !email || !password){
            return res.json({message: "Please fill all the fields"});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({message: "User already exists"});
        }
//hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', //use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Adjust sameSite attribute based on environment, CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds, we should set the cookie expiration to match the token expiration for consistency
    });

    return res.json ({success: true, user: {name: user.name, email: user.email}});

    } 
    catch (error) {
    console.log(error); // 👈 add this
    return res.json({message: error.message});
}
}
// Login user : /api/user/login
export const login = async (req,res)=>{
   try{
     const {email,password} = req.body;

     if(!email || !password){
        return res.json({message: "Please fill all the fields"});
     }
     const user = await User.findOne({email});
     
     if(!user){
        return res.json({message: "User not found"});
     }
     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch){
        return res.json({message: "Invalid credentials"});
     }

     const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

     res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', //use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Adjust sameSite attribute based on environment, CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds, we should set the cookie expiration to match the token expiration for consistency
     });

    return res.json ({success: true, user: {name: user.name, email: user.email}});



}
catch (error) {    
        console.log(error); // 👈 add this
        return res.json({message: error.message});
   }
}

// /api/user/is-Auth
export const authUser = async(req,res)=>{
    try{

        const {userId} = req.body;
        const user = await User.findById(userId).select('-password'); //.select(-password) is for remove the password data
        return res.json({success:true, user});
 
    }catch(error){

        console.log(error);
        return res.json({message: error.message});      

    }
}
