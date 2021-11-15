
const CheckAuthenticated = (req,res,next) =>{
    if(!req.isAuthenticated()){
        return res.redirect("/login")
    }
    next()
}

const checkAdmin = (req,res,next) =>{
    if((req.isAuthenticated) && (req.user.role == "Administrator")){
        return next()
    }
    return res.redirect("*")
}

const checkTeacher = (req,res,next) =>{
    if((req.isAuthenticated()) && (req.user.role == "Teacher")){
        if (req.user.isBlocked){
            return res.render("error",{error: "Your account has been blocked!"});
        }
        return next()
    }
    return res.redirect("*")
}

const checkStudent = (req,res,next) =>{
    if((req.isAuthenticated()) && (req.user.role == "Student")){
        if (req.user.isBlocked){
            return res.render("error",{error: "Your account has been blocked!"});
        }
        return next()
    }
    return res.redirect("*")
}
module.exports = {
    CheckAuthenticated,
    checkAdmin,
    checkTeacher,
    checkStudent
}