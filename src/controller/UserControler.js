// import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken';
import ProductsModel from "../models/ProductsModel.js";
import productController from "./productConroller.js";

const UsersController={
   getList: async(req, res)=>{
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
         let role;
         try{
            role=data.role
         }
         catch{
            role='user'
         }
         const user= await UserModel.find({email:email});
         if(user.length > 0)
            res.status(401).json({message:"המשתמש כבר רשום"})

         const nameExists = await UserModel.find({ name });
         if (nameExists.length > 0) // בדיקה אם שם המשתמש קיים
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

         if (!user) 
            return res.status(401).json({ message: "שם משתמש או סיסמה לא נכונים" });
        
          const token = jwt.sign(
            {
               id: user._id,
                name: user.name,
                email: user.email,
                role:user.role,
            },
            process.env.JWT_SECRET || "8t7r5v@#hk",  // אותו סוד כמו ב-middleware
            { 
                expiresIn: '24h' // תוקף הטוקן - 24 שעות
            }
        );

        // החזרת התשובה עם הטוקן ופרטי המשתמש
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
   getCart: async(req,res)=>{
      try{
         const myUser = await UserModel.findOne({_id:req.user.id})
            .populate('cart.productId');  // populate product details
         
         if(!myUser) {
            return res.status(404).json({message: "המשתמש לא נמצא"});
         }
         
         // Transform cart items to include current product details
         const transformedCart = myUser.cart.map(item => ({
            id: item.productId._id,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price,
            discount: item.productId.discount,
            image: item.productId.image,
            quantity: item.quantity,
            // Calculate current price with discount
            currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
         }));

         res.status(200).json({
            cart: transformedCart,
            // Calculate total
            total: transformedCart.reduce((sum, item) => 
                sum + (item.currentPrice * item.quantity), 0)
         });
      }
      catch(error) {
         console.error('Error in getCart:', error);
         res.status(500).json({ message: 'שגיאה בהוצאת סל הקניות', error: error.message });
      }
   },
   addToCart: async(req, res) => {
    try {
        console.log('Request body:', req.body); // לוג של הנתונים שהתקבלו
        const { id, quantity = 1 } = req.body;
        const userId = req.user.id;

        console.log('Looking for product with ID:', id);
        // תיקון: שימוש ב-findById במקום findOne
        const product = await ProductsModel.findById(id);
        console.log('Found product:', product);

        if (!product) {
            return res.status(404).json({
                message: "המוצר המבוקש לא נמצא"
            });
        }
        // בדיקת תקינות הכמות
        if (quantity <= 0) {
            return res.status(400).json({
                message: "כמות המוצר חייבת להיות חיובית"
            });
        }

        console.log('Looking for user with ID:', userId);
        const user = await UserModel.findById(userId);
        console.log('Found user:', user);

        if (!user) {
            return res.status(404).json({
                message: "משתמש לא נמצא"
            });
        }

        // תיקון: שימוש ב-id במקום productId
        const existingCartItem = user.cart.find(
            item => item.productId.toString() === id
        );

        console.log('Existing cart item:', existingCartItem);

        if (existingCartItem) {
            existingCartItem.quantity = quantity;
            console.log('Updated quantity:', existingCartItem.quantity);
        } else {
            user.cart.push({
                productId: id,
                quantity: quantity
            });
            console.log('Added new item to cart');
        }

        await user.save();
        console.log('User saved successfully');
        
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
                image: item.productId.image,
                quantity: item.quantity,
                currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
            };
            console.log('Transformed cart item:', cartItem);
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
        console.log('Request body:', req.body); // לוג של הנתונים שהתקבלו
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ message: "חסר מזהה מוצר למחיקה" });
        }

        console.log('Looking for user with ID:', userId);
        const user = await UserModel.findById(userId);
        console.log('Found user:', user);

        if (!user) {
            return res.status(404).json({ message: "משתמש לא נמצא" });
        }

        // מציאת אינדקס המוצר בסל
        const itemIndex = user.cart.findIndex(item => item.productId.toString() === id);
        console.log('Item index in cart:', itemIndex);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "המוצר לא נמצא בסל" });
        }

        // הסרת המוצר מהסל
        user.cart.splice(itemIndex, 1);
        await user.save();
        console.log('Item removed and user saved');

        // החזרת סל מעודכן
        const updatedUser = await UserModel.findById(userId).populate('cart.productId');
        const transformedCart = updatedUser.cart.map(item => ({
            id: item.productId._id,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price,
            discount: item.productId.discount,
            image: item.productId.image,
            quantity: item.quantity,
            currentPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
        }));
        const total = transformedCart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
        console.log('Cart after removal:', transformedCart);
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
        console.log('Request body:', req.body);
        const { id } = req.body;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ message: "חסר מזהה מוצר לעדכון כמות" });
        }

        console.log('Looking for user with ID:', userId);
        const user = await UserModel.findById(userId);
        console.log('Found user:', user);

        if (!user) {
            return res.status(404).json({ message: "משתמש לא נמצא" });
        }

        const itemIndex = user.cart.findIndex(item => item.productId.toString() === id);
        console.log('Item index in cart:', itemIndex);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "המוצר לא נמצא בסל" });
        }

        if (user.cart[itemIndex].quantity > 1) {
            user.cart[itemIndex].quantity -= 1;
            console.log('Decreased quantity:', user.cart[itemIndex].quantity);
        } else {
            user.cart.splice(itemIndex, 1);
            console.log('Removed item from cart because quantity was 1');
        }

        await user.save();
        console.log('User saved successfully after decrease');

        // החזרת סל מעודכן
        const updatedUser = await UserModel.findById(userId).populate('cart.productId');
        const transformedCart = updatedUser.cart.map(item => ({
            id: item.productId._id,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price,
            discount: item.productId.discount,
            image: item.productId.image,
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
