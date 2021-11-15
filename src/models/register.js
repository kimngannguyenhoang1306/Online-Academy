const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Students"
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    }
},{
    timestamps: true
})
const Register = mongoose.model("Registers",RegisterSchema);

module.exports = Register;