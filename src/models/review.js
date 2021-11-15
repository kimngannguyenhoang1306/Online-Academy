const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    comment:{
        type:String,
        required: true
    },
    Star:{
        type: Number,
        required:true,
        min:1,
        max:5,
    },
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
const Review = mongoose.model("Reviews",ReviewSchema);

module.exports = Review;