const express = require('express');
const router = express.Router();
const Course = require('../models/course');
router.get('/courses-registered',async (req, res) =>{
    try {
        const student = req.user;
        const courses = await Methods.getCoursesRegistered(student);
        for (let index = 0; index < courses.length; index++)
            await courses[index].populate("owner").exec();
        console.log(courses)
        res.render("registeredCourses", {
            courses,
            role: req.user.role,
            user: req.user,
        });
    } catch (e) {
        res.send(e);
    }
})

module.exports=router;