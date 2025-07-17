import CategoryModel from "../models/CategoryModel.js"

const CategoryController={

   getList: async (req, res)=>{
      try{
         const cate = await CategoryModel.find();
         res.json({ cate });
         }
      catch(e){
         res.status(400).json({message:"e.message"});
      }
   },
}

export default CategoryController