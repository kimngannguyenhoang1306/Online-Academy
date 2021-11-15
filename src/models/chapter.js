const mongoose = require("mongoose");
const validator = require("validator");
const ChapterSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses"
    },
    completed:{
        type: Boolean,
        default: false
    }
})
ChapterSchema.virtual("VideoList",{
    ref:"Videos",
    localField:"_id",
    foreignField:"chapter"
})

const Chapters = mongoose.model("Chapters",ChapterSchema)

const VideoSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        require
    },
    chapter:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Chapters",
        require: true
    },
    url:{
        type: String,
        trim: true,
        required: true,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Please provide a valid URL")
            }
        }
    }
})
const Videos = mongoose.model("Videos",VideoSchema);

module.exports = {
    Chapters,
    Videos
}