import OrderModel from '../models/OrderModel.js'
import UserModel from '../models/UserModel.js'

const OrderController={
   getList: async (req, res)=>{
      let orders=[]

      try{
         orders= await OrderModel.find();
         res.json({orders});
      }
      catch(e){
         res.status(400).json({message:e.message});
      }
   },
   getByUserId:async (req, res)=>{
      try{
         let orders=[];
         orders= await OrderModel.find({userId: req.params.userId})
         res.json({orders});
      }
      catch(e){
         res.status(400).json({message:e.message});
      }
   },
   getByOrderId: async (req, res)=>{
      try{
         const order= await OrderModel.find({orderId:req.params.orderId});
         res.json(order);
      }
      catch(e){
         res.status(400).json({message:e.message});
      }
   },
   addOrder: async(req, res)=>{
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "חסר מזהה משתמש"
                });
            }

            // מציאת המשתמש וטעינת פרטי המוצרים בסל
            const user = await UserModel.findById(userId).populate('cart.productId');
            
            if (!user) {
                return res.status(404).json({
                    message: "משתמש לא נמצא"
                });
            }

            if (!user.cart || user.cart.length === 0) {
                return res.status(400).json({
                    message: "סל הקניות ריק"
                });
            }

            // הכנת פריטי ההזמנה מהסל
            const items = user.cart.map(item => ({
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                quantity: item.quantity,
                discount: item.productId.discount,
                finalPrice: item.productId.price * (1 - (item.productId.discount || 0) / 100)
            }));

            // חישוב הסכום הכולל
            const sum = items.reduce((total, item) => 
                total + (item.finalPrice * item.quantity), 0);

            // יצירת מזהה הזמנה ייחודי
            const orderid = 'ORD-' + Date.now();

            // יצירת ההזמנה
            const newOrder = await OrderModel.create({
                orderid,
                userId,
                items,
                sum,
                statusOrder: false
            });

            // איפוס הסל של המשתמש
            user.cart = [];
            await user.save();

            // החזרת ההזמנה שנוצרה
            res.status(201).json({
                message: "ההזמנה נוצרה בהצלחה והסל אופס",
                order: {
                    ...newOrder._doc,
                    expectedDelivery: newOrder.destinationDate
                }
            });
        }
        catch(e) {
            console.error('Error in addOrder:', e);
            res.status(500).json({
                message: "שגיאה ביצירת ההזמנה",
                error: e.message
            });
        }
   }
}
export default OrderController