const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const url = "mongodb+srv://admin:0994955919asd@project.0syvs.mongodb.net/web-online-academy?retryWrites=true&w=majority";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.once('open', function(){
    console.log('Connection has been made, now make fireworks...');
}).on('error', function(error){
    console.log('Connection error:', error);
});

