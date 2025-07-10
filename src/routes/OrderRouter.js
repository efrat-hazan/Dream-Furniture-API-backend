import OrderController from "../controller/OrderController.js"
import express from "express";
import {jwtMiddleware} from "../../MiddleWares.js"
import {managerMiddleware} from "../../MiddleWares.js"
const OrderRouter = express.Router();

OrderRouter.use(jwtMiddleware);
OrderRouter.get("/all",managerMiddleware,OrderController.getList);
OrderRouter.get("/:orderId",OrderController.getByOrderId);
OrderRouter.get("/myOrders/userId",OrderController.getByUserId)
OrderRouter.post('/', OrderController.addOrder);


export default OrderRouter