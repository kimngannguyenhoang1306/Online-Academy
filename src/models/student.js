const mongoose = require("mongoose");
const Users = require("./user");
const extendSchema = require("mongoose-extend-schema");
const bcrypt = require("bcrypt");
const StudentSchema = extendSchema(Users,{
    otp:{
      type: Number
    },
    isBlocked:{
        type: Boolean,
        default: false
    },
    role:{
        type:String,
        default: "Student",
        required: true
    },
    phoneNumber:{
        type: String,
        required: true,
        strim: true,
    },
    confirmed:{
        type: Boolean,
        default: false
    },
    //Student can have many many students registered
    CoursesRegistered:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    }],
    //Student can have many many students liked (watch list)
    CoursesLiked:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    }],
})
StudentSchema.pre("save",async function  (next){
    const user = this 
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8) /// HASH FOR 8 ROUNDS
    }
    next()
})
const Students = mongoose.model("Students",StudentSchema);
module.exports = Students;