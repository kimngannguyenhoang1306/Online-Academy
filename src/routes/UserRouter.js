const express = require('express');
const router = express.Router();
const userController = require('../app/controller/userController');
const Validate = require(".././middleware/middleware");
const passport = require("passport");

router.post('/test',userController.test);
router.get('/login',userController.getLogin);
router.post(
    '/login',
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);
router.get('/profile',userController.getProfile);
router.post('/profile',userController.postProfile);
router.get('/register',userController.getRegister);
router.get('/confirm-email',userController.getConfirmEmail);
router.post('/confirm-email',userController.postConfirmEmail);
router.post('/register',userController.postRegister);
router.get('/product-detail',userController.getProductDetail);
router.get('/register-course',Validate.CheckAuthenticated,userController.registerCourse);
router.get('/watchlist',Validate.CheckAuthenticated,userController.getwatchList);
router.get('/add-watchlist',Validate.CheckAuthenticated,userController.getAddWatchList);
router.get('/courses-registered',Validate.CheckAuthenticated,userController.getCourseRegistered);
router.get('/remove-watchlist',Validate.CheckAuthenticated,userController.removeWatchList);
router.get('/remove-watchlist/:id',Validate.CheckAuthenticated,userController.getRemoveWatchListByID);
router.post('/add-review',Validate.CheckAuthenticated,userController.postAddView);
router.get('/course-list',userController.getCourseList);
router.post('/course-list',userController.postCourseList);
router.get('/logout',userController.getLogOut);
router.get('/',userController.index);
router.get("*", (req, res) => {
    res.render("error", {
        title: "404 NOT FOUND!",
        error:
            "The page you are trying to connect does not exist or you are not authorized to access!",
    });
});

module.exports = router;