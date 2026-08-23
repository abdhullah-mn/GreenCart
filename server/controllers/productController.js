import { cloudinary } from "../config/cloudinary.js";
import Product from "../models/Product.js";



// add product : /api/product/add
export const addProduct = async(req,res)=>{
    try{
        const productData = JSON.parse(req.body.productData);
        const image = req.files || [];
        const imagesUrl = await Promise.all(
            image.map(async(item)=>{

                const result = await cloudinary.uploader.upload(item.path, {resource_type: "image"});
                return result.secure_url;

            })
        )
    
        await Product.create({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            offerPrice: productData.offerPrice,
            image: imagesUrl,
            category: productData.category,
            inStock: productData.inStock ?? true
        });
        res.status(201).json({success: true, message: "Product added successfully"});


    }catch(error){

        console.log(error);
        res.status(400).json({success: false, message: error.message});

    }



    



}

// Get product : /api/product/list 
export const productList = async (req,res)=>{

    try{
        const products = await Product.find({}); // Fetch all products from the database
        res.json({ success: true, products }); // Send the products as a JSON response  


    }catch(error){
        console.log(error);
        res.json({ success: false, message: "Failed to fetch products" });

    }
}

// Get single product : /api/product/id
export const productById = async (req,res)=>{
    try{
        const id = req.params.id || req.body.id;
        const product = await Product.findById(id);// Fetch the product with the specified ID from the database
        if(product){
            res.json({ success: true, product }); // Send the product as a JSON response
        }else{
            res.json({ success: false, message: "Product not found" });
        }   

    }catch(error){
        console.log(error);
        res.json({ success: false, message: "Failed to fetch product" });

    }


}

//change product in stock : /api/product/stock
export const changeStock = async(req,res)=>{

    try{
        const {id,inStock}=req.body;
        await Product.findByIdAndUpdate(id, {inStock: inStock}); // Update the inStock status of the product with the specified ID in the database
        res.json({ success: true, message: "Stock status updated successfully" }); // Send a success response
    }catch(error){
        console.log(error);
        res.json({success: false, message: "Failed to update stock status" }); // Send an error response
    }



}

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if (!product) return res.status(404).json({success: false, message: "Product not found"});
        res.json({success: true, product});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({success: false, message: "Product not found"});
        res.json({success: true, message: "Product deleted successfully"});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};