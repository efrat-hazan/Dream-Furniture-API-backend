// import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import ProductsModel from "../models/ProductsModel.js";
import dotenv from "dotenv";
dotenv.config();

const UsersController={
    getList: async(req, res)=>{// all users for manager
      let users=[]
      try{
         users= await UserModel.find().select('-password -role');
         res.json({users});
      }
      catch(e){
         res.status(400).json({message:e.message})
      }
   },

   add: async (req, res)=>{
      try{
         const data=req.body;
         console.log(req.body);
         const email=data.email;
         const name= data.name;
         const password= data.password;         

         const user= await UserModel.find({email:email});//one account per user
         if(user.length > 0)
            res.status(401).json({message:"המשתמש כבר רשום"})

         const nameExists = await UserModel.find({ name });
         if (nameExists.length > 0) // checking if the username exists
            return res.status(401).json({ message: "שם משתמש כבר קיים" });

         const newUser=await UserModel.create({name,password,email,role});
         res.status(200).json({user:newUser,message:"נרשמת בהצלחה עבור להתחברות"});
      }
      catch(e){
         res.status(400).json({message:e.message});
      }
   },
   login: async(req, res)=>{
        try {
         const dataBody = req.body; 
         if(dataBody.name==undefined||dataBody.password==undefined)
            res.status(401).json({massege:"No suitable data was sent."}) 

         const user = await UserModel.findOne({ name: dataBody.name, password: dataBody.password });
         if (!user)// There is no such user.
            return res.status(401).json({ message: "שם משתמש או סיסמה לא נכונים" });
        
          const token = jwt.sign( //token authorization
            {
               id: user._id,
                name: user.name,
                email: user.email,
                role:user.role,
            },
            process.env.JWT_SECRET,  
            { 
                expiresIn: '24h' // Token validity - 24 hours
            }
        );

        // Return the response with the token and user details
        res.json({ 
            message: "התחברת בהצלחה",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role:user.role
            }
        });
    }
    catch(e) {
        console.error('Error in login:', e);
        res.status(500).json({ 
            message: "שגיאה בתהליך ההתחברות",
            error: e.message 
        });
    }
   },
   getCart: async (req, res) => {
  try {
    const myUser = await UserModel.findOne({ _id: req.user.id }).populate('cart.productId');

    if (!myUser) {
      return res.status(404).json({ message: "המשתמש לא נמצא" });
    }

    // Transform cart items to include current product details, with image URL
    const transformedCart = myUser.cart.map(item => ({
      id: item.productId._id,
      name: item.productId.name,
      description: item.productId.description,
      price: item.productId.price,
      discount: item.productId.discount,
      quantity: item.quantity,
      image: `/products/image/${item.productId._id}`,
      currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
    }));

    const total = transformedCart.reduce(
      (sum, item) => sum + (item.currentPrice * item.quantity),
      0
    );

    res.status(200).json({
      cart: transformedCart,
      total: total
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({
      message: 'שגיאה בהוצאת סל הקניות',
      error: error.message
    });
  }
},
   addToCart: async(req, res) => {
    try {
        const { id, quantity = 1 } = req.body;
        const userId = req.user.id;
  
        const product = await ProductsModel.findById(id);
        if (!product) {
            return res.status(404).json({
                message: "המוצר המבוקש לא נמצא"
            });
        }
        // Checking the correctness of the quantity
        if (quantity <= 0) {
            return res.status(400).json({
                message: "כמות המוצר חייבת להיות חיובית"
            });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "משתמש לא נמצא"
            });
        }

        const existingCartItem = user.cart.find(//Search whether the product is already in the cart
            item => item.productId.toString() === id
        );


        if (existingCartItem) {//If so, only the quantity is updated.
            existingCartItem.quantity = quantity;
        } else {
            user.cart.push({//If not added as a new product
                productId: id,
                quantity: quantity
            });
        }

        await user.save();        
        // Return updated cart with populated product details
        const updatedUser = await UserModel.findById(userId)
            .populate('cart.productId');
        // Transform cart items to include current prices
        const transformedCart = updatedUser.cart.map(item => {
            const cartItem = {
                id: item.productId._id,
                name: item.productId.name,
                description: item.productId.description,
                price: item.productId.price,
                discount: item.productId.discount,
                image: `/products/image/${item.productId.image}` ,
                quantity: item.quantity,
                currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
            };
            return cartItem;
        });

        const total = transformedCart.reduce((sum, item) => 
            sum + (item.currentPrice * item.quantity), 0);
        console.log('Cart total:', total);

        res.status(200).json({
            message: "המוצר נוסף לסל בהצלחה",
            cart: transformedCart,
            total: total
        });

    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({
            message: "שגיאה בעדכון סל הקניות",
            error: error.message
        });
    }
},
removeFromCart: async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ message: "חסר מזהה מוצר למחיקה" });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "משתמש לא נמצא" });
        }
     // Finding the product index in the cart
        const itemIndex = user.cart.findIndex(item => item.productId.toString() === id);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "המוצר לא נמצא בסל" });
        }
        // Removing the product from the cart
        user.cart.splice(itemIndex, 1);
        await user.save();
        console.log('Item removed and user saved');

        // Return an updated basket
        const updatedUser = await UserModel.findById(userId).populate('cart.productId');
        const transformedCart = updatedUser.cart.map(item => ({
            id: item.productId._id,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price,
            discount: item.productId.discount,
           image: `/products/image/${item.productId._id}` ,
            quantity: item.quantity,
            currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
        }));

        const total = transformedCart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
        res.status(200).json({
            message: "המוצר הוסר מהסל בהצלחה",
            cart: transformedCart,
            total: total
        });
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        res.status(500).json({
            message: "שגיאה בעדכון סל הקניות",
            error: error.message
        });
    }
},
decreaseCartItemQuantity: async(req, res) => {
    try {
        const { id } = req.body;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ message: "חסר מזהה מוצר לעדכון כמות" });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "משתמש לא נמצא" });
        }
     // Finding the product index in the cart
        const itemIndex = user.cart.findIndex(item => item.productId.toString() === id);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "המוצר לא נמצא בסל" });
        }

        if (user.cart[itemIndex].quantity > 1) {
            user.cart[itemIndex].quantity -= 1;
        } else {
            user.cart.splice(itemIndex, 1);
        }

        await user.save();
        // Return an updated basket
        const updatedUser = await UserModel.findById(userId).populate('cart.productId');
        const transformedCart = updatedUser.cart.map(item => ({
            id: item.productId._id,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price,
            discount: item.productId.discount,
            image: `/products/image/${item.productId._id}`,
            quantity: item.quantity,
            currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
        }));
        
        const total = transformedCart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
        res.status(200).json({
            message: "הכמות עודכנה/הפריט הוסר מהסל בהצלחה",
            cart: transformedCart,
            total: total
        });
    } catch (error) {
        console.error('Error in decreaseCartItemQuantity:', error);
        res.status(500).json({
            message: "שגיאה בעדכון סל הקניות",
            error: error.message
        });
    }
},
}
export default UsersController
