const Students = require("../../models/student");
const Teachers = require("../../models/teacher");
const Admin = require("../../models/admin");
const Courses = require("../../models/course");
const Review = require("../../models/review");
const {Chapters, Videos} = require("../../models/chapter");
const Category = require("../../models/category");
const Register = require("../../models/register");
const Methods = require("./Methods");
const OS = require("os");
const passport = require("passport");
const check = require('../../middleware/middleware');
const Send_Mail = require("../../otp_confirm/otp_confirm");

class UserController {

    ///HOME
    async index(req, res) {
        if(req.isAuthenticated() && req.user.isBlocked){
            req.logOut();
            res.render("error",{error : "Your account has been blocked!"})
        }
        else {
            if (req.isAuthenticated() && req.user.role === "Teacher") {
                const courses = await Methods.getCoursesOwned(req.user.id);
                courses.sort(function (a, b) {
                    return b.createdAt - a.createdAt;
                });
                for (const e of courses) {
                    let index = courses.indexOf(e);
                    const teacher = await Methods.getCourseLecturer(e.id);
                    courses[index].owner = teacher;
                    const cate = await Methods.GetCateName(e.id);
                    courses[index].category = cate;
                    courses[index].starArr = Methods.GetStarArr(courses[index].score);
                }
                const number_course = courses.length;
                res.render("index", {
                    user: req.user,
                    role: req.user.role,
                    course_owned: number_course,
                    courses,
                });
            } else if (req.isAuthenticated() && req.user.role === "Administrator") {
                const numCourse = await Courses.countDocuments();
                const numTeacher = await Teachers.countDocuments();
                const numStudent = await Students.countDocuments();
                const numReview = await Review.countDocuments();
                const numRegister = await Register.countDocuments();
                res.render("index", {
                    user: req.user,
                    role: req.user.role,
                    numCourse,
                    numTeacher,
                    numStudent,
                    numReview,
                    numRegister,
                });
            } else {
                const courses = await Courses.find();
                for (const e of courses) {
                    let index = courses.indexOf(e);
                    const teacher = await Methods.getCourseLecturer(e.id);
                    courses[index].owner = teacher;
                    const cate = await Methods.GetCateName(e.id);
                    courses[index].category = cate;
                    courses[index].starArr = Methods.GetStarArr(courses[index].score);
                }
                let featuredCourses = [];
                const now = new Date();
                let registers = await Register.find({
                    createdAt: {$gte: now - 604800000},
                }) ?? [];

                for (let i = 0; i < registers.length; i++) {
                    await registers[i].populate("course")
                    await registers[i].course.populate("category")
                    await registers[i].course.populate("owner")
                }
                
                let categories = await Category.find({});
                for (let i = 0; i < categories.length; i++) {
                    let count = 0;
                    for (let j = 0; j < registers.length; j++) {
                        if (categories[i].id == registers[j].course.category.id) {
                            count++;
                        }
                        categories[i].number_of_student = count;
                    }
                }
                categories.sort((a, b) => {
                    return b.number_of_student - a.number_of_student
                })
                if (categories.length > 5)
                    categories.slice(0, 5);
                registers.forEach((e) => featuredCourses.push(e.course));
        
                const seen = new Set();
                featuredCourses = featuredCourses.filter((el) => {
                    const duplicate = seen.has(el.id);
                    seen.add(el.id);
                    return !duplicate;
                });
                featuredCourses.sort(function (a, b) {
                    return b.number_of_student - a.number_of_student;
                });
        
                let mostViewCourses = JSON.parse(JSON.stringify(courses));
                mostViewCourses.sort(function (a, b) {
                    return b.number_of_student - a.number_of_student;
                });
        
                let newestCourses = JSON.parse(JSON.stringify(courses));
                newestCourses.sort(function (a, b) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
        
                if (featuredCourses.length > 3) {
                    featuredCourses = featuredCourses.slice(0, 3);
                }
                if (mostViewCourses.length > 10) {
                    mostViewCourses = mostViewCourses.slice(0, 10);
                }
                if (newestCourses.length > 10) {
                    newestCourses = newestCourses.slice(0, 10);
                }
                for (const e of featuredCourses) {
                    let index = featuredCourses.indexOf(e);
                    featuredCourses[index].starArr = Methods.GetStarArr(featuredCourses[index].score);
                }
                for (const e of mostViewCourses) {
                    let index = mostViewCourses.indexOf(e);
                    mostViewCourses[index].starArr = Methods.GetStarArr(mostViewCourses[index].score);
                }
                for (const e of newestCourses) {
                    let index = newestCourses.indexOf(e);
                    newestCourses[index].starArr = Methods.GetStarArr(newestCourses[index].score);
                }
        
                if (req.isAuthenticated()) {
                    if (!req.user.confirmed && req.user.role === "Student") {
                        req.logOut();
                        res.render("error", {
                            title: "EMAIL NOT CONFIRMED!",
                            error: "Please confirm your email before using our services!",
                        });
                    } else {
                        res.render("index", {
                            categories,
                            featuredCourses,
                            mostViewCourses,
                            newestCourses,
                            user: req.user,
                            role: req.user.role
                        });
                    }
                }
                else {
                    res.render("index", {
                        categories,
                        featuredCourses,
                        mostViewCourses,
                        newestCourses,
                    });
                }
            }
        }
        
        
    }
    //TEST
    async test(req, res) {
        console.log("REQ " + req.body.mytextarea);
        return res.render("test", {data: req.body.mytextarea});
    }

    ///GET LOGIN
    async getLogin(req, res) {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        res.render("login");
    }

    ///GET PROFILE
    async getProfile(req, res) {
        if (!req.isAuthenticated()) {
            return res.redirect("/login");
        } else if (req.user.role === "Student" && !req.user.confirmed) {
            req.logOut();
            res.render("error", {
                title: "EMAIL NOT CONFIRMED!",
                error: "Please confirm your email before using our services!",
            });
        } else {
            res.render("profile", {
                role: req.user.role,
                user: req.user,
            });
        }
    }

    ///POST PROFILE
    async postProfile(req, res) {
        try {
            if (req.body.o_password.length == 0) {
                const user = req.user;
                user.email = req.user.email;
                user.phoneNumber = req.body.phoneNumber;
                user.name = req.body.name;
                await user.save();
                res.render("profile", {
                    user: req.user,
                    role: req.user.role,
                    success_message: "Information saved",
                });
            } else {
                const user = req.user;
                if (req.body.o_password !== user.password) {
                    res.render("profile", {
                        user: req.user,
                        role: req.user.role,
                        error_message: "Wrong password!",
                    });
                } else if (req.body.new_password !== req.body.confirm_password) {
                    res.render("profile", {
                        user: req.user,
                        role: req.user.role,
                        error_message: "Confirm password does not match!",
                    });
                } else if (
                    req.body.new_password === "" ||
                    req.body.confirm_password === ""
                ) {
                    res.render("profile", {
                        user: req.user,
                        role: req.user.role,
                        error_message: "New password can not be blank",
                    });
                } else if (
                    req.body.o_password === user.password &&
                    req.body.new_password === req.body.confirm_password
                ) {
                    user.password = req.body.new_password;
                    await user.save();
                    res.render("profile", {
                        user: req.user,
                        role: req.user.role,
                        success_message: "Information saved",
                    });
                }
            }
        } catch (e) {
            res.send(e);
        }
    };
    ///GET REGISTER
    async getRegister(req, res) {
        res.render("register");
    }

    ///GET CONFIRM EMAIL
    async getConfirmEmail(req, res) {
        const student = await Students.findById(req.query.id);
        if (student.confirmed === false) {
            await student.save();
            res.render("confirm", {
                message: "INPUT YOUR OTP CODE TO CONFIRM YOUR ACCOUNT",
                StuID: req.query.id,
            });
        } else {
            res.render("confirm", {
                message: "YOUR EMAIL HAS ALREADY BEEN CONFIRMED",
            });
        }
    }

    ///POST CONFIRM EMAIL
    async postConfirmEmail(req, res) {
        const id = req.body.ID;
        const OTP = req.body.OTP;
        const stu = await Students.findById(id);
        if (stu.otp == OTP) {
            stu.confirmed = true;
            await stu.save();
        }
        return res.redirect("/confirm-email?id=" + id);
    }

    ///POST REGISTER
    async postRegister(req, res) {
        try {
            if (req.body.password === req.body.confirmPassword) {
                const stu = await Students.findOne({email: req.body.email});
                if (stu) {
                    res.render("register", {
                        fail_message: "Email already existed, please choose another one!",
                    });
                } else {
                    const OTP = Methods.getRandomInt(1111,9999);
                    const student = new Students({
                        name: req.body.name,
                        email: req.body.email,
                        phoneNumber: req.body.phone,
                        password: req.body.password,
                        otp: OTP,
                    });
                    await student.save();
                    const host = req.headers.host;
                    const url =
                        "http://"+host+"/confirm-email?id="+student._id.toString();
                    
                    await Send_Mail(url, student.email, OTP);
                    res.render("register", {
                        success_message:
                            "Account created successfully, check your mailbox to confirm your email",
                    });
                }
            } else {
                res.render("register", {
                    fail_message: "Confirm password does not match",
                });
            }
        } catch (e) {
            res.send(e);
        }
    }
    //GET PRODUCT DETAIL
    async getProductDetail(req, res) {
        const options = {year: 'numeric', month: 'short', day: 'numeric'};
        const categories = await Category.find({});
        const CourseID = req.query.id;
        res.cookie("CourseID", CourseID);
        let course = await Courses.findById(CourseID).populate(['owner','category']).exec();
        let reviewList = await Methods.ShowReviewList(CourseID);
        if (!course.isBlocked){
            for (let e of reviewList) {
                const index = reviewList.indexOf(e);
                const StudentComment = await Methods.getStudentSpecs(e.id);
                reviewList[index] = StudentComment;
            }
            for (let i = 0; i < reviewList.length; i++) {
                let temp = JSON.parse(JSON.stringify(reviewList[i]));
                temp.Star = Methods.GetStarArr(temp.Star);
                temp.createdAt.tostring
                temp.date = new Date(temp.createdAt).toLocaleDateString(undefined, options);
                reviewList[i] = temp;
            }
            var time = new Date(course.updatedAt);
            course.date = new Date(course.updatedAt).toLocaleDateString(undefined, options);
            course.number_of_student = course.number_of_student.toLocaleString();
            course.starArr = Methods.GetStarArr(course.score);
            course.relatedCourses = await Methods.GetRelatedCourses(course.category);
            let index = course.relatedCourses.findIndex(
                (e) => e._id.toString() === course._id.toString()
            );
            course.relatedCourses.splice(index, 1);
            if (course.relatedCourses.length > 5) {
                course.relatedCourses = course.relatedCourses.slice(0, 5);
            }
        
            for (let index = 0; index < course.relatedCourses.length; index++) {
                course.relatedCourses[index].starArr = Methods.GetStarArr(
                    course.relatedCourses[index].score
                );
                course.relatedCourses[index] = await Courses.findById(CourseID).populate(["owner","category"]).exec();
            }
            // Query chapters of course
            const chapters = await Methods.viewChapterList(CourseID);
        
            const videolist = await Methods.getbyCourseID(CourseID);
            let previewVideos = [];
            if (videolist.length > 0)
                previewVideos = videolist[0].videos;
            const allCourses = await Courses.find();
            let mostViewCourses = JSON.parse(JSON.stringify(allCourses));
            mostViewCourses = await Methods.CourseSortAs(
                mostViewCourses,
                "number_of_student",
                -1
            );
            let newViewCourses = JSON.parse(JSON.stringify(allCourses));
            newViewCourses = await Methods.CourseSortAs(
                newViewCourses,
                "createdAt",
                -1
            );
            mostViewCourses = mostViewCourses.slice(0, 3);
            newViewCourses = newViewCourses.slice(0, 3);
            if (mostViewCourses.some((e) => e._id == course._id))
                course.isBestseller = true;
        
            if (newViewCourses.some((e) => e._id == course._id))
                course.isNewest = true;
            if (req.isAuthenticated()) {
                if (!req.user.confirmed && req.user.role === "Student") {
                    req.logOut();
                    res.render("error", {
                        title: "EMAIL NOT CONFIRMED!",
                        error: "Please confirm your email before using our services!",
                    });
                } else {
                    const isCommented = await Methods.isReviewed(req.user.id, CourseID);
                    const isLiked = await Methods.isLiked(req.user.id, CourseID);
                    const isRegistered = await Methods.isRegistered(req.user.id, CourseID);
                    if (isCommented) {
                        isCommented.starArr = Methods.GetStarArr(isCommented.Star)
                        //console.log("isCommtented", isCommented)
                        const date = new Date(isCommented.createdAt).toLocaleDateString(undefined, options);
                        res.render("product-detail", {
                            course,
                            reviewList,
                            isCommented,
                            date,
                            isLiked,
                            isRegistered,
                            categories,
                            chapters,
                            previewVideos,
                            videolist,
                            role: req.user.role,
                            user: req.user,
                        });
                    } else {
                        res.render("product-detail", {
                            course,
                            reviewList,
                            isCommented: null,
                            isLiked,
                            isRegistered,
                            categories,
                            chapters,
                            previewVideos,
                            videolist,
                            role: req.user.role,
                            user: req.user,
                        });
                    }
                }
            } else {
                res.render("product-detail", {
                    course,
                    reviewList,
                    isCommented: null,
                    categories,
                    chapters,
                    previewVideos,
                    videolist,
                });
            }
        }
       
    }

    ///GET REGISTER COURSE
    async registerCourse(req, res) {
        try {
            const student = req.user;
            const CourseID = req.cookies["CourseID"];
            await Methods.registerCourse(student.id, CourseID);
            const check = Methods.isRegistered(student.id, CourseID);
            return res.redirect("/product-detail/?id=" + CourseID.toString());
        } catch (e) {
            res.send(e);
        }
    }

    ///GET WATCH LIST
    async getwatchList(req, res) {
        try {
            const student = req.user;
            const courses = await Methods.ShowWatchList(student);
            var temp = [];
            for (let index = 0; index < courses.length; index++)
                {
                    temp[index] = await Courses.findById(courses[index].id).populate("owner").exec();
                    courses[index].owner = temp[index].owner
                }
            res.render("watchlist", {
                courses,
                role: req.user.role,
                user: req.user,
            });
        } catch (e) {
            res.send(e);
        }
    }

    ///GET ADD WATCH LIST
    async getAddWatchList(req, res) {
        try {
            const student = req.user;
            const CourseID = req.cookies["CourseID"];
            await Methods.addtCourseToWatchList(student.id, CourseID);
            const check = Methods.isLiked(student.id, CourseID);
            return res.redirect("/product-detail/?id=" + CourseID);
        } catch (e) {
            res.send(e);
        }
    }

    ///GET COURSE REGISTER
    async getCourseRegistered(req, res) {
        try {
            const student = req.user;
            const courses = await Methods.getCoursesRegistered(student);
            var temp =[];
            for (let index = 0; index < courses.length; index++)
                {
                    temp[index] = await Courses.findById(courses[index].id).populate("owner").exec();
                    courses[index].owner = temp[index].owner
                }
                console.log(courses)
            res.render("registeredCourses", {
                courses,
                role: req.user.role,
                user: req.user,
            });
        } catch (e) {
            res.send(e);
        }
    }

    ///Unregister course
    async postCourseRegistered(req, res) {
        console.log(req.body);
        if (req.body.action == "unregister_course") {
            const courseid = await Courses.findById(req.body.unregisterCourseIdInput);
            const userid = await Student.findById(req.body.userUnregisterCourse)
            UnregisteredCourse(userid, courseid);
        }
        return res.redirect("/courses-registered");
      }

    ///GET REMOVE WATCH LIST
    async removeWatchList(req, res) {
        try {
            const student = req.user;
            const CourseID = req.cookies["CourseID"];
            await Methods.RemoveCourseFromWatchList(student.id, CourseID);
            const check = Methods.isLiked(student.id, CourseID);
            return res.redirect("/product-detail/?id=" + CourseID);
        } catch (e) {
            res.send(e);
        }
    }

    ///GET REMOVE WATCH LIST BY ID
    async getRemoveWatchListByID(req, res) {
        try {
            const student = req.user;
            const CourseID = req.params.id;
            await Methods.RemoveCourseFromWatchList(student.id, CourseID);
            const check = Methods.isLiked(student.id, CourseID);
            return res.redirect("/watchlist");
        } catch (e) {
            res.send(e);
        }
    }

    ///POST ADD VIEW
    async postAddView(req, res) {
        try {
            const student = req.user;
            const CourseID = req.cookies["CourseID"];
            await Methods.AddCourseReview(
                req.body.review_content,
                parseInt(req.body.num_star),
                student.id,
                CourseID
            );
            console.log(req.body.num_star);
            return res.redirect("/product-detail/?id=" + CourseID);
        } catch (e) {
            res.send(e);
        }
    }

    ///GET COURSE LIST
    async getCourseList(req, res) {
        const categories = await Category.find({});
        let option = "";
        let host = req.originalUrl;
        // if (req.query.sortPrice) {
        //     host = host.split("?")[0] + "?";
        //     let status = null;
        //     req.query.sortPrice == "1"
        //         ? ((status = 1), (option = "Ascending Price"))
        //         : ((status = -1), (option = "Descending Price"));
        //     let courses = await Methods.FetchCourseSortAs("price", status);
        //     for (const e of courses) {
        //         let index = courses.indexOf(e);
        //         const teacher = await Methods.getCourseLecturer(e.id);
        //         courses[index].owner = teacher;
        //         const cate = await Methods.GetCateName(e.id);
        //         courses[index].category = cate;
        //         courses[index].starArr = Methods.GetStarArr(courses[index].score);
        //     }
        //     courses = Methods.GetPagination(courses);
    
        //     res.render("product-list", {
        //         categories,
        //         courses,
        //         option,
        //         host,
        //         role: req.isAuthenticated() ? req.user.role : null,
        //         user: req.isAuthenticated() ? req.user : null,
        //     });
        // } else if (req.query.sortRate) {
        //     host = host.split("?")[0] + "?";
        //     let status = null;
        //     req.query.sortRate == "1"
        //         ? ((status = 1), (option = "Ascending Rate Score"))
        //         : ((status = -1), (option = "Descending Rate Score"));
        //     let courses = await Methods.FetchCourseSortAs("score", status);
        //     for (const e of courses) {
        //         let index = courses.indexOf(e);
        //         const teacher = await Methods.getCourseLecturer(e.id);
        //         courses[index].owner = teacher;
        //         const cate = await Methods.GetCateName(e.id);
        //         courses[index].category = cate;
        //         courses[index].starArr = Methods.GetStarArr(courses[index].score);
        //     }
        //     courses = Methods.GetPagination(courses);
        //     res.render("product-list", {
        //         categories,
        //         courses,
        //         option,
        //         host,
        //         role: req.isAuthenticated() ? req.user.role : null,
        //         user: req.isAuthenticated() ? req.user : null,
        //     });
        if (req.query.searchValue) {
            host = host.split("&")[0] + "&";
            var courses = await Methods.searchCourseFullText(req.query.searchValue);
            var attri = null;
            req.query.price ? (attri = "price") : (attri = "score");
            if (attri === "price") {
                if (req.query[attri] == "-1") option = "Descending Price";
                else option = "Ascending Price";
            } else {
                if (req.query[attri] == "-1") option = "Descending Rate Score";
                else option = "Ascending Rate Score";
            }
            courses = await Methods.CourseSortAs(
                courses,
                attri,
                parseInt(req.query[attri])
            );
            const allCourses = await Courses.find();
            let mostViewCourses = JSON.parse(JSON.stringify(allCourses));
            mostViewCourses = await Methods.CourseSortAs(
                mostViewCourses,
                "number_of_student",
                -1
            );
            let newViewCourses = JSON.parse(JSON.stringify(allCourses));
            newViewCourses = await Methods.CourseSortAs(
                newViewCourses,
                "createdAt",
                -1
            );
            mostViewCourses = mostViewCourses.slice(0, 3);
            newViewCourses = newViewCourses.slice(0, 3);
            for (let i = 0; i < courses.length; i++) {
                if (mostViewCourses.some((e) => e._id == courses[i]._id)) {
                    courses[i].isBestseller = true;
                }
    
                if (newViewCourses.some((e) => e._id == courses[i]._id)) {
                    courses[i].isNewest = true;
                }
            }
            if (courses.length === 0) {
                courses = null;
            } else {
                for (const e of courses) {
                    let index = courses.indexOf(e);
                    const teacher = await Methods.getCourseLecturer(e.id);
                    courses[index].owner = teacher;
                    const cate = await Methods.GetCateName(e.id);
                    courses[index].category = cate;
                    courses[index].starArr = Methods.GetStarArr(courses[index].score);
                }
    
                courses = Methods.GetPagination(courses);
            }
            res.render("product-list", {
                categories,
                courses,
                option,
                host,
                role: req.isAuthenticated() ? req.user.role : null,
                user: req.isAuthenticated() ? req.user : null,
            });
        } else if (req.query.categoryName) {
            let courses = await Methods.FetchCourseByCateName(req.query.categoryName);
            host = host.split("&")[0] + "&";
    
            var attri = null;
            req.query.price ? (attri = "price") : (attri = "score");
            if (attri === "price") {
                if (req.query[attri] == "-1") option = "Descending Price";
                else option = "Ascending Price";
            } else {
                if (req.query[attri] == "-1") option = "Descending Rate Score";
                else option = "Ascending Rate Score";
            }
            courses = await Methods.CourseSortAs(
                courses,
                attri,
                parseInt(req.query[attri])
            );
            for (const e of courses) {
                let index = courses.indexOf(e);
                const teacher = await Methods.getCourseLecturer(e.id);
                courses[index].owner = teacher;
                const cate = await Methods.GetCateName(e.id);
                courses[index].category = cate;
                courses[index].starArr = Methods.GetStarArr(courses[index].score);
            }
            courses = Methods.GetPagination(courses);
            res.render("product-list", {
                categories,
                courses,
                option,
                host,
                role: req.isAuthenticated() ? req.user.role : null,
                user: req.isAuthenticated() ? req.user : null,
            });
        } else {
            host = host.split("?")[0] + "?";
            let courses = await Courses.find();
            var attri = null;
            req.query.price ? (attri = "price") : (attri = "score");
            if (attri === "price") {
                if (req.query[attri] == "-1") option = "Descending Price";
                else option = "Ascending Price";
            } else {
                if (req.query[attri] == "-1") option = "Descending Rate Score";
                else option = "Ascending Rate Score";
            }
            courses = await Methods.CourseSortAs(
                courses,
                attri,
                parseInt(req.query[attri])
            );
            for (const e of courses) {
                let index = courses.indexOf(e);
                const teacher = await Methods.getCourseLecturer(e.id);
                courses[index].owner = teacher;
                const cate = await Methods.GetCateName(e.id);
                courses[index].category = cate;
                courses[index].starArr = Methods.GetStarArr(courses[index].score);
            }
            courses = Methods.GetPagination(courses);
            res.render("product-list", {
                categories,
                courses,
                option,
                host,
                role: req.isAuthenticated() ? req.user.role : null,
                user: req.isAuthenticated() ? req.user : null,
            });
        }
    }
    
    ///POST COURSE LIST
    async postCourseList(req, res) {
        if (req.body.searchValue) {
            return res.redirect(
                "/course-list?searchValue=" + req.body.searchValue + "&score=-1"
            );
        }
    }

    ///GET LOG OUT
    async getLogOut(req, res) {
        req.logOut();
        return res.redirect("/login");
    }

  
}

module.exports = new UserController;