// import expressJS, path & handlerbars
require("./src/authentication/authentication");
require("./src/database/connect");
const bodyParser = require("body-parser");
const passport = require("passport")
const express = require('express')
const path = require('path');
const hbs = require('hbs');
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser")

const flash = require("express-flash")
const session  = require("express-session")
const publicPath = path.join(__dirname, 'src/public') // link to css/img
const viewsPath = path.join(__dirname, 'src/resources/views/layouts') //link to views (HTML/HBS/ejs)
const partialPath = path.join(__dirname, 'src/resources/views/partials')
//Template Engine
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())


//import 
hbs.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
hbs.registerHelper("arrayof", function(array, value, options)
{
    return array[parseInt(value)];
});
app.use(express.json()) // every object automatically turn into JSON formatted

app.use(flash())
app.use(session({
    secret:"None",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
//import route func
const route = require('./src/routes/index');

//setup handlerbars engine and views location

app.set('views', viewsPath);
app.set('view engine', 'hbs');

app.use(express.json())
app.use(express.static(publicPath))
hbs.registerPartials(partialPath);

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

route(app);

app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${port}`)
  })

  // app.get('/', (req, res) => {

  //   res.render('index');

  // })