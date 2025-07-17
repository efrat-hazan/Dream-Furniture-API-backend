import ProductsModel from "../models/ProductsModel.js";


const productController = {
    getByCategoryId: async(req, res) => {
        try {
            const categoryIdNum = Number(req.params.categoryId);

            const products = await ProductsModel.find({ categoryId: categoryIdNum }).select('-image');
            const mapped = products.map(prod => ({
                _id: prod._id,
                productId: prod.productId,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                discount: prod.discount,
                categoryId: prod.categoryId,
                image: `/products/image/${prod._id}`
                }));
            res.json({ products: mapped })
        }
        catch (e) {
            res.status(400).json({message: e.message})
        }
    }, 
    getImage: async (req, res) => {
        try {
            const product = await ProductsModel.findById(req.params.id).select('image');
            if (!product || !product.image || !product.image.data) {
            return res.status(404).send("Image not found");
            }

            res.set("Content-Type", product.image.contentType);
            res.set("Cache-Control", "public, max-age=86400");
            res.send(product.image.data);
        } catch (err) {
            res.status(500).send("Error loading image");
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
            const response = {
            _id: product._id,
            productId: product.productId,
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            categoryId: product.categoryId,
            imageUrl: `/products/image/${product._id}` 
            };
            res.json({ product:response });
        }
        catch(e) {
            res.status(400).json({message: e.message});
        }
    },
    addProduct: async(req, res) => {
    try {
        console.log("I'm hear");       
        // קבלת הנתונים מהבקשה
        const { productId, name, description, price, discount, categoryId } = req.body;
        const imageFile = req.file;
        // בדיקת תקינות הנתונים החיוניים
        if (!productId || !name || !price || !imageFile  || !categoryId) {
            return res.status(400).json({ 
                message: "חסרים שדות חובה. נדרש: מזהה מוצר, שם, מחיר, תמונה וקטגוריה" 
            });
        }

        // יצירת מוצר חדש
        const newProduct = await ProductsModel.create({
            productId, name, description: description || "", // אם אין תיאור, יישמר כמחרוזת ריקה
            price, discount: discount || 0, // אם אין הנחה, יישמר כ-0
             image: {
                data: imageFile.buffer,
                contentType: imageFile.mimetype
            }, 
            categoryId
        });
        console.log("seccs,"+newProduct);
        
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