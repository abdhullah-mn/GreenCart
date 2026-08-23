import express from "express";
import { addProduct, changeStock, productList, productList } from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import authseller from "../middleware/authseller.js";

const productRouter = express.Router();

productRouter.post("/add", upload.array("images"), authseller, addProduct);
productRouter.put("/stock",authseller, changeStock);
productRouter.get("/list", productList);
productRouter.get("/id", productById);

export default productRouter;