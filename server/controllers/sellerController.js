import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const registeredSellers = globalThis.__registeredSellers ??= [];

const createSellerToken = (email, name = 'Seller') =>
  jwt.sign({ email, name, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const registerSeller = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingSeller = registeredSellers.find((seller) => seller.email === normalizedEmail);

        if (existingSeller) {
            return res.status(409).json({ success: false, message: 'A seller with this email already exists.' });
        }

        const seller = {
            id: Date.now().toString(),
            name: String(name).trim(),
            email: normalizedEmail,
            password: String(password).trim(),
        };

        registeredSellers.push(seller);

        const token = createSellerToken(normalizedEmail, seller.name);
        res.cookie('sellerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            message: 'Seller registered successfully.',
            seller: { name: seller.name, email: seller.email },
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sellerLogin = async(req,res)=>{
    try{
        const {email,password} = req.body || {};
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '').trim();

        const registeredSeller = registeredSellers.find(
            (seller) => seller.email === normalizedEmail && seller.password === normalizedPassword
        );

        if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
            const token = createSellerToken(process.env.SELLER_EMAIL, 'GreenCart Seller');
            res.cookie('sellerToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.json ({success: true, message: 'Logged In', seller: { name: 'GreenCart Seller', email: process.env.SELLER_EMAIL }});
        }

        if (registeredSeller) {
            const token = createSellerToken(registeredSeller.email, registeredSeller.name);
            res.cookie('sellerToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.json({ success: true, message: 'Seller logged in.', seller: { name: registeredSeller.name, email: registeredSeller.email } });
        }

        return res.status(401).json({success: false, message: 'Invalid Credentials'});
    } catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message: error.message});
    }
};

export const isAuth = async(req,res)=>{
    try{
        return res.json({success:true, seller: req.seller || {}});
    }catch(error){
        console.log(error);
        return res.json({message: error.message});
    }
};

export const sellerLogout = async (req,res)=>{
    try{
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });
        return res.json({success:true, message:'Seller Logged Out'});
    } catch(error){
        console.log(error);
        return res.json({message: error.message});
    }
};
