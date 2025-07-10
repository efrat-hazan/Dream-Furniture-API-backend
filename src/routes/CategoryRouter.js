import express from "express"
import CategoryController from "../controller/CategoryController.js"

 const CategoryRouter=express.Router();
 CategoryRouter.get("/",CategoryController.getList);

 export default CategoryRouter;