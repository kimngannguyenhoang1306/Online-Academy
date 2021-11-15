const mongoose = require("mongoose");
const Users = require("./user");
const extendSchema = require("mongoose-extend-schema");
const bcrypt = require("bcrypt");
const AdminSchema = extendSchema(Users,{
    role:{
        type:String,
        default: "Administrator",
        required: true
    },
    phoneNumber:{
        type:String,
        required: true,
    }
})
AdminSchema.pre("save",async function  (next){
    const user = this 
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8) /// HASH FOR 8 ROUNDS
    }
    next();
})
const Admin = mongoose.model("Admin",AdminSchema);

module.exports = Admin;