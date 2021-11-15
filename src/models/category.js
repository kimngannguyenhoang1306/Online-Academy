const mongoose = require("mongoose");

const CateSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    }
})


const Category = mongoose.model("Categories",CateSchema);

module.exports = Category;