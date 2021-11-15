const express = require('express');
const router = express.Router();
const courseController = require('../app/controller/courseController');

router.post('/owner',courseController.postCourseOwner);
router.post('/create',courseController.postCreateCourse);

module.exports = router;