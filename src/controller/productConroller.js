import ProductsModel from "../models/ProductsModel.js";

const productController = {
      // פונקציה פנימית שמחזירה את התוצאות
      // async findProductsByCategory(categoryId) {
      //    return await ProductsModel.find({id: req.params.id});
      // },

      getByCategoryId: async(req, res) => {
         try {
               const categoryIdNum = Number(req.params.categoryId);

            const products = await ProductsModel.find({ categoryId: categoryIdNum });
           
            res.json({products})
         }
         catch (e) {
            res.status(400).json({message: e.message})
         }
      }, 
      getByItemId: async(req, res) => {
         try {
            const { itemId } = req.params;
            
            // מחפש מוצר ספציפי בתוך קטגוריה מסוימת
            const product = await ProductsModel.findOne({ 
                
                _id: itemId 
            });
            
            if (!product) {
                return res.status(404).json({ message: "הפריט לא נמצא בקטגוריה המבוקשת" });
            }

            res.json({ product });
         }
         catch(e) {
            res.status(400).json({message: e.message});
         }
      },
     
      addProduct: async(req, res) => {
    try {
        // קבלת הנתונים מהבקשה
        const { productId, name, description, price, discount, image, categoryId } = req.body;
        
        // בדיקת תקינות הנתונים החיוניים
        if (!productId || !name || !price || !image || !categoryId) {
            return res.status(400).json({ 
                message: "חסרים שדות חובה. נדרש: מזהה מוצר, שם, מחיר, תמונה וקטגוריה" 
            });
        }

        // יצירת מוצר חדש
        const newProduct = await ProductsModel.create({
            productId, name, description: description || "", // אם אין תיאור, יישמר כמחרוזת ריקה
            price, discount: discount || 0, // אם אין הנחה, יישמר כ-0
            image, categoryId
        });

        // החזרת המוצר שנוצר
        res.status(201).json({ 
            message: "המוצר נוסף בהצלחה",
            product: newProduct 
        });
    }
    catch(e) {
        // במקרה של שגיאה בשמירת המוצר
        res.status(400).json({
            message: "שגיאה בהוספת המוצר",
            error: e.message
        });
    }
}
}

export default productController;