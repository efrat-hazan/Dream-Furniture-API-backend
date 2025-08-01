import mongoose,{version} from "mongoose";

const orderSchema=mongoose.Schema({
   orderid:{
      type:String,
      required:true
   },
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
   },
   items: [{
      productId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'product',
         required: true
      },
      name: String,
      price: Number,
      quantity: Number,
      discount: Number,
      finalPrice: Number
   }],
   sum:{
      type:Number,
      required:true
   },
   date: {
      type: Date,
      default: Date.now    // Will automatically set the current date when creating the order
   },
   destinationDate:{
      type:Date,
      default: function() {
            const date = new Date();
            date.setDate(date.getDate() + 20); // Adds 20 days to the current date
            return date;
        }
   },
   statusOrder: {
      type: Boolean,
      default: false
   }
},{versionKey:false});

export default mongoose.model("orders",orderSchema);