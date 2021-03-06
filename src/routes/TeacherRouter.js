const express = require('express');
const router = express.Router();
const teacherController = require('../app/controller/teacherController');
const Validate = require(".././middleware/middleware");

router.get('/add-course',Validate.checkTeacher,teacherController.getAddCourse);
router.get('/courses-management',Validate.checkTeacher,teacherController.getCourseMange);
router.get('/view-course',Validate.checkTeacher,teacherController.getViewCourse);
router.post('/add-course',Validate.checkTeacher,teacherController.postAddCourse);
router.post('/courses-management',Validate.checkTeacher,teacherController.postCourseManage);
router.post('/view-course',Validate.checkTeacher,teacherController.postViewCourse);

module.exports = router;
