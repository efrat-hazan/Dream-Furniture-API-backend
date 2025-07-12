import mongoose from "mongoose";

const productSchema=mongoose.Schema({
   ptoductId:{
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

   image:{
        type:String,
        required:true
    },
    categoryId:{
        type:Number,
        required:true
    },
},{versionKey:false});

export default mongoose.model("product",productSchema);