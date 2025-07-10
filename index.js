import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser';
// import dotenv from 'dotenv';
import connectDB from "./database.js";
import UserRouter from "./src/routes/UserRouter.js"
import ProductRouter from "./src/routes/ProductRouter.js"
import CategoryRouter from "./src/routes/CategoryRouter.js"
import OrderRouter from "./src/routes/OrderRouter.js"


const app=express();
const port = 3000;
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use('/users', UserRouter);
app.use('/products', ProductRouter);
app.use('/orders',OrderRouter);
app.use('/categories',CategoryRouter);

app.listen(port, () =>
    console.log(`Example app listening on http://localhost:${port}`)
)