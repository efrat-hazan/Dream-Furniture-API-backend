import express from "express";
import productController from "../controller/productConroller.js";
import {jwtMiddleware} from "../../MiddleWares.js"
import {managerMiddleware} from "../../MiddleWares.js"
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const ProductRouter = express.Router();

// נתיבים ציבוריים - לא דורשים אימות
ProductRouter.get('/:categoryId', productController.getByCategoryId);
ProductRouter.get('/product/:itemId', productController.getByItemId);
ProductRouter.get('/image/:id', productController.getImage);

// מכאן והלאה - נתיבים שדורשים אימות
ProductRouter.use(jwtMiddleware,managerMiddleware);
ProductRouter.post('/', upload.single("image"), productController.addProduct);

export default ProductRouter;
