import mongoose, {version} from "mongoose";

const userSchema=mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email: String,
    role:{
        type: String,
        default:"user"
    },
    cart:{
        type:[{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }],
        default:[]
    }
   
},{versionKey: false})

export default mongoose.model("users", userSchema)


