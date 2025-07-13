import mongoose from "mongoose";

const productSchema=mongoose.Schema({
   productId:{
        type:String,
        required:true
    },
   name: {
        type: String,
        required:true
    },
    description: String,

    price:{
        type:Number,
        required:true
    },
    discount: Number,

    image: {
    data: Buffer,
    contentType: String
  },
    categoryId:{
        type:Number,
        required:true
    },
},{versionKey:false});

export default mongoose.model("product",productSchema);