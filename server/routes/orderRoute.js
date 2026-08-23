import express from "express";
import { placeOrderCOD, getUserOrders, getAllOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";

const orderRouter = express.Router();
orderRouter.post('/cod',authUser, placeOrderCOD); 
orderRouter.get('/user',authUser, getUserOrders); 
orderRouter.get('/seller',authSeller, getAllOrders); 
orderRouter.get('/:id', authUser, getOrderById);
orderRouter.put('/:id/status', authSeller, updateOrderStatus);

export default orderRouter;