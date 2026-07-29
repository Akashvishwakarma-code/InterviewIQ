import mongoose from "mongoose";

const userScheme = new mongoose.Schema({},{timestamps:true
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    credits:{
        type:Number,
        default:100
    }
})

const User = mongoose.model("User","userSchema");

export default User;