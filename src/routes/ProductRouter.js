import express from "express";
import productController from "../controller/productConroller.js";
import {jwtMiddleware} from "../../MiddleWares.js"
import {managerMiddleware} from "../../MiddleWares.js"
const ProductRouter = express.Router();

// נתיבים ציבוריים - לא דורשים אימות
ProductRouter.get('/:categoryId', productController.getByCategoryId);
ProductRouter.get('/product/:itemId', productController.getByItemId);

// מכאן והלאה - נתיבים שדורשים אימות
ProductRouter.use(jwtMiddleware,managerMiddleware);
ProductRouter.post('/', productController.addProduct);

export default ProductRouter;
