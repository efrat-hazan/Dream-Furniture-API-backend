import OrderController from "../controller/OrderController.js"
import express from "express";
import {jwtMiddleware} from "../../MiddleWares.js"
import {managerMiddleware} from "../../MiddleWares.js"
const OrderRouter = express.Router();

OrderRouter.use(jwtMiddleware);
OrderRouter.get("/all",managerMiddleware,OrderController.getList);
OrderRouter.get("/:orderId",OrderController.getByOrderId);
OrderRouter.get("/",OrderController.getByUserId);
OrderRouter.post('/', OrderController.addOrder);
OrderRouter.put("/:orderId",OrderController.updateOrderStatus);

export default OrderRouter