import mongoose from "mongoose";

const categorySchema=mongoose.Schema({
 id:{
   type:String,
   required:true
 },
 name:{
   type:String,
   required:true
 },
 icon:{
   type:String,
   required:true
 },
 path:{
   type:String,
   required:true
 },
 img:String
},{versionKey: false})

export default mongoose.model("categories",categorySchema);
