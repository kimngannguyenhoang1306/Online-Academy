const Students = require("../../models/student");
const Teachers = require("../../models/teacher");
const Admin = require("../../models/admin");
const Courses = require("../../models/course");
const Reviews = require("../../models/review");
const {Chapters, Videos} = require("../../models/chapter");
const Cate = require("../../models/category");
const Register = require("../../models/register");
const Methods = require("./Methods");


class TeacherController {
    //GET ADD COURSE
    async getAddCourse(req, res) {
        const cate = await Cate.find({})
        res.render("addCourse", { cate, role: req.user.role, user: req.user });
      }

    //POST ADD COURSE
    async postAddCourse(req, res) {
        const categories = await Cate.find({})
        const cate = categories
        try {
          const imageID = req.body.avatar.split('/')[5]
          const baseURl = "https://drive.google.com/thumbnail?id=" + imageID
          const course = new Courses({
            name: req.body.name,
            category: req.body.category,
            owner: req.user.id,
            avatar: baseURl,
            brief_description: req.body.brief_des,
            full_description: req.body.full_des,
            price: req.body.price,
          })
          await course.save()
          res.render("addCourse", { cate, categories, success_message: "Course added successfully", role: req.user.role, user: req.user });
        } catch (e) {
          res.render("addCourse", { cate, categories, error_message: e, role: req.user.role, user: req.user });
        }
      }

    ///GET COURSE MANAGEMENT (TEACHER)
    async getCourseMange(req, res) {
        const courses = await Methods.getCoursesOwned(req.user._id);
        for (const e of courses) {
          let index = courses.indexOf(e);
          const cate = await Methods.GetCateName(e.id)
          courses[index].category = cate
        }
        const categories = await Cate.find({})
        res.render("manage-courses", {
          courses,
          categories,
          role: req.user.role, user: req.user
        });
      }
    
    ///POST COURSE MANAGEMENT (TEACHER)
    async postCourseManage(req, res) {
        console.log(req.body);
        if (req.body.action == "remove_course") {
          console.log("Pass");
          await Methods.DeleteCourse(req.body.courseIdInput);
        }
        return res.redirect("/teacher/courses-management");
      
      }
    
    ///GET VIEW COURSE (TEACHER)
    async getViewCourse(req, res) {
        const categories = await Cate.find({})
        const CourseID = req.query.id;
        res.cookie("CourseID", CourseID)
        const courses = await Methods.getCoursesOwned(req.user._id);
        for (let index = 0; index < courses.length; index++) {
          const course = courses[index];
          if (course._id == CourseID) {
      
            const chapters = await Methods.viewChapterList(CourseID);
      
            // Check
            const videolist = await Methods.getbyCourseID(CourseID);
            res.render("viewCourse", { course, categories, chapters, videolist, role: req.user.role, user: req.user });
          }
        }
      }
    
    ///POST VIEW COURSE (TEACHER)
    async postViewCourse(req, res) {

        const CourseID = req.cookies['CourseID'];
        console.log(req.body);
        console.log(req.body.action);
        if (req.body.action == "course_detail") {
          // Update course's detail
          let ava = null
          if (req.body.avatarInput !== '') {
            ava = req.body.avatarInput
          }
          await Methods.UpdateCourseDetail(CourseID.toString(), ava, req.body.courseNameInput, req.body.briefDescriptionInput, req.body.priceInput, req.body.statusInput);
          console.log("Pass course detail");
        }
        else if (req.body.action == "course_description") {
          // Update main description
          const NewDesc = req.body.desc;
          await Methods.UpdateDescription(CourseID.toString(), NewDesc);
          console.log("Pass course desc");
        }
        else if (req.body.action == "add_session") {
          // Add session
          await Methods.AddChapter(CourseID, req.body.sessionNameInput);
          console.log("Pass add session");
        }
        else if (req.body.action == "remove_session") {
          await Methods.DeleteChapter(req.body.sessionIdInput);
          console.log("Pass remove session");
        }
        else if (req.body.action == "change_session_name") {
          var chapter = await Methods.getChapterSpecs(req.body.ChapterIdInput2);
          chapter.name = req.body.changeSessionNameInput;
          await chapter.save();
        }
        else if (req.body.action == "add_video") {
          await Methods.AddVideo(req.body.ChapterIdInput, req.body.VideoNameInput, req.body.url);
        }
        else if(req.body.action=="remove_video"){
          await Methods.DeleteVideo(req.body.VideoIdInput)
        }else if(req.body.action=="change_video_name"){
          const video = await Videos.findById(req.body.VideoIdInput)
          video.name = req.body.changeVideoNameInput
          await video.save()
        }
        return res.redirect("/teacher/view-course?id=" + CourseID.toString());
      }
}

module.exports = new TeacherController;