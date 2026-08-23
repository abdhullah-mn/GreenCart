import express from "express";
import { placeOrderCOD, getUserOrders, getAllOrders } from "../controllers/orderController.js";

const orderRouter = express.Router();
orderRouter.post('/cod',authUser, placeOrderCOD); 
orderRouter.get('/user',authUser, getUserOrders); 
orderRouter.get('/seller',authUser, getAllOrders); 

export default orderRouter;