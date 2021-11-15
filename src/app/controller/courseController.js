const Courses = require("../../models/course");
const Method = require("./Methods");

class CourseController {
    ///POST CREATE COURSE
    async postCreateCourse(req,res) {  
        try{
            const course = new Courses(req.body)
            await course.save();
            res.send(course)
        }catch(e){
            res.send(e)
        }
    }
    ///POST COURSE OWNER
    async postCourseOwner(req,res) {
        try{
            const courseID = req.query.id;
            const owner = await Method.getCourseOwner(courseID)
            res.send(owner)
    
        }catch(e){
            res.send(e)
        }
    }

}

module.exports= new CourseController ;