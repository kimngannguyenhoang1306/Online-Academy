const express = require('express');
const router = express.Router();
const adminController = require('../app/controller/adminController');
const Validate = require(".././middleware/middleware");


router.post('/add-category',adminController.createCate);
router.get('/courses-management',Validate.checkAdmin,adminController.getCourseManage);
router.post('courses-management',adminController.postCourseManage);
router.get('/categories-management',Validate.checkAdmin,adminController.getCateManage);
router.post('/categories-management',adminController.postCateManage);
router.get('/users-management',Validate.checkAdmin,adminController.getUserManage);
router.post('/users-management',adminController.postUserManage);
router.get('/view-course',Validate.checkAdmin,adminController.getViewCourse);
router.post('/view-course',adminController.postViewCourse);
router.get('/course-list',Validate.checkAdmin,adminController.getCourseList);
router.post('/course-list',adminController.postCourseList);


module.exports = router;