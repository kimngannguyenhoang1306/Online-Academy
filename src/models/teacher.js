const mongoose = require("mongoose");
const Users = require("./user");
const extendSchema = require("mongoose-extend-schema");
const bcrypt = require("bcrypt")
const TeacherSchema = extendSchema(Users,{
    isBlocked:{
        type: Boolean,
        default: false
    },
    role:{
        type:String,
        default: "Teacher",
        required: true
    },
    phoneNumber:{
        type: String,
        required: true,
        strim: true,
    },
})

TeacherSchema.virtual('CoursesOwned',{
    ref: 'Courses',
    localField: '_id', //The teacher ID as the primary key
    foreignField: 'owner'
})
TeacherSchema.pre("save",async function  (next){
    const user = this 
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,8) /// HASH FOR 8 ROUNDS
    }
    next()
})
const Teachers = mongoose.model("Teachers", TeacherSchema )
module.exports = Teachers;