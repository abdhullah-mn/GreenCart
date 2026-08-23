import express from "express";
import { addProduct, changeStock, productList, productById, updateProduct, deleteProduct } from "../controllers/productController.js";
import upload from "../config/multer.js";
import authSeller from "../middlewares/authSeller.js";

const productRouter = express.Router();

productRouter.post("/add", upload.array("images"), authSeller, addProduct);
productRouter.put("/stock", authSeller, changeStock);
productRouter.put("/:id", authSeller, updateProduct);
productRouter.delete("/:id", authSeller, deleteProduct);
productRouter.get("/list", productList);
productRouter.get("/id/:id", productById);

export default productRouter;