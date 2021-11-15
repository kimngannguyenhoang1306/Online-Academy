const mongoose = require("mongoose");
const validator = require("validator");
const Users = new mongoose.Schema({
        name:{
            required: true,
            type: String,
            strim: true,           
        },
        email:{
            required: true,
            type: String,
            strim: true,
            checkIsEmail(value){
                if(!validator.isEmail(valie)){
                    throw new Error("Not an email");
                }
            }
        },
        password:{
            required: true,
            type:String,
            strim: true,
            minlength: 6,
        }
})
module.exports = Users;