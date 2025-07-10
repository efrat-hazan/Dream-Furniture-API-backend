import express from "express";
import UserController from "../controller/UserControler.js";
import { jwtMiddleware } from "../../MiddleWares.js";
import { managerMiddleware } from "../../MiddleWares.js";
const UserRouter = express.Router();

// נתיבים פתוחים - לא דורשים אימות
UserRouter.post("/add", UserController.add);
UserRouter.post("/login", UserController.login);

// כל הנתיבים מכאן והלאה דורשים אימות
 UserRouter.use(jwtMiddleware);

UserRouter.get("/",managerMiddleware, UserController.getList);
UserRouter.get("/cart",UserController.getCart);
UserRouter.post("/cart/add", UserController.addToCart);
UserRouter.delete("/:id",UserController.removeFromCart);
UserRouter.delete("/", UserController.decreaseCartItemQuantity)

export default UserRouter;