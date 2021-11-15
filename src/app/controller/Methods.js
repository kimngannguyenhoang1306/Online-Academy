const Students = require("../../models/student");
const Teachers = require("../../models/teacher");
const Admin = require("../../models/admin");
const Courses = require("../../models/course");
const Reviews = require("../../models/review");
const {Chapters, Videos} = require("../../models/chapter");
const Cate = require("../../models/category");
const Register = require("../../models/register");

//REGISTER 
const PlaceAnOrder = async (StudentID, CourseID) => {
    const Regis = new Register({
        owner: StudentID,
        course: CourseID
    })
    await Regis.save()
}
//GET COURSE OWNER
const getCourseLecturer = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("owner").exec();
    return course.owner;
};

//GET TEACHER'S COURSES (TEACHER)
const getCoursesOwned = async (TeacherID) => {
    const teacher = await Teachers.findById(TeacherID).populate("CoursesOwned").exec();
    return teacher.CoursesOwned;
};
///////////////////////REGISTER
//REGISTER A CLASS (STUDENT)
const registerCourse = async (StudentID, CourseID) => {
    try {
        const student = await Students.findById(StudentID);
        const course = await Courses.findById(CourseID).populate("StudentsRegistered").exec();
        if (
            course.StudentsRegistered.includes(student.id) ||
            student.CoursesRegistered.includes(course.id)
        ) {
            throw Error("Course already existed in your inventory");
        } else {
            student.CoursesRegistered = student.CoursesRegistered.concat(course.id);
            course.StudentsRegistered = course.StudentsRegistered.concat(student.id);
            course.number_of_student = course.number_of_student + 1;
            await PlaceAnOrder(StudentID, CourseID)
            await student.save();
            await course.save();
        }
    } catch (e) {
        console.log(e);
    }
};

//GET STUDENTS' REGISTERED (ADMIN)
const getStudentsRegistered = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("StudentsRegistered").exec();
    return course.StudentsRegistered;
};
//SHOW COURSES' REGISTERED (STUDENT)
const getCoursesRegistered = async (StudentID) => {
    const student = await Students.findById(StudentID).populate("CoursesRegistered").exec();
    return student.CoursesRegistered.toObject();
};
//SHOW COURSES' UNREGISTERED (STUDENT)
const UnregisteredCourse = async (StudentID, CourseID) => {
    const course = await Courses.findById(CourseID).populate("StudentsRegistered").exec();
    const index = course.StudentsRegistered.indexOf(StudentID);
    course.StudentsRegistered.splice(index, 1);
    course.number_of_student = number_of_student - 1;
    const Student = await Students.findById(StudentID);
    const index1 = Student.CoursesRegistered.indexOf(CourseID);
    Student.CoursesRegistered.splice(index1, 1);
    await course.save();
    await Student.save();
};
////////////////////WATCH LIST
//ADD COURSE TO WATCHLIST (STUDENT)
const addtCourseToWatchList = async (StudentID, CourseID) => {
    try {
        const student = await Students.findById(StudentID);
        const course = await Courses.findById(CourseID).populate("StudentsLiked").exec();
        if (
            course.StudentsLiked.includes(student.id) ||
            student.CoursesLiked.includes(course.id)
        ) {
            throw Error("Course is already existed in your watchlist");
        } else {
            student.CoursesLiked = student.CoursesLiked.concat(course.id);
            course.StudentsLiked = course.StudentsLiked.concat(student.id);
            await student.save();
            await course.save();
        }
    } catch (e) {
        console.log(e);
    }
};
///SHOW COURSES IN WATCH LIST
const ShowWatchList = async (StudentID) => {
    const student = await Students.findById(StudentID).populate("CoursesLiked").exec();
    return student.CoursesLiked.toObject();
};
///REMOVE COURSE FROM WATCH LIST
const RemoveCourseFromWatchList = async (StudentID, CourseID) => {
    const student = await Students.findById(StudentID);
    const index1 = student.CoursesLiked.indexOf(CourseID);
    student.CoursesLiked.splice(index1, 1);
    await student.save();
    const course = await Courses.findById(CourseID).populate("StudentsLiked").exec();
    course.StudentsLiked = course.StudentsLiked.filter((e) => {
        return e._id != StudentID;
    });
    await course.save();
};

//////////// REVIEW
const getStudentSpecs = async (ReviewID) => {
    const review = await Reviews.findById(ReviewID).populate("owner").exec();
    return review;
};
const UpdateRated = async (CourseID) => {
    
    const course = await Courses.findById(CourseID).populate("ReviewList").exec();
    
    var rate = 0;
 
    course.ReviewList.forEach((element) => {
        rate += element.Star;
    });
    rate /= course.ReviewList.length;
    course.score = rate.toFixed(1);
    await course.save();
};
const isLiked = async (StudentID, CoursesID) => {
    const student = await Students.findById(StudentID);
    if (student.CoursesLiked.includes(CoursesID)) {
        return true;
    } else {
        return false;
    }
};
const isRegistered = async (StudentID, CoursesID) => {
    const student = await Students.findById(StudentID);
    if (student.CoursesRegistered.includes(CoursesID)) {
        return true;
    } else {
        return false;
    }
};
const isReviewed = async (StudentID, CourseID) => {
    const review = await Reviews.findOne({owner: StudentID, course: CourseID}).populate("owner").exec();
    if (review) return review;
    else return null;
};
const AddCourseReview = async (text, star, StudentID, CourseID) => {
    try {
        const check = await isReviewed(StudentID, CourseID);
        if (!check) {
            const review = new Reviews({
                comment: text,
                Star: star,
                course: CourseID,
                owner: StudentID,
            });
           
            console.log(review.Star);
            const course = await Courses.findById(CourseID).populate("ReviewList").exec();
            course.ReviewList.concat(review.id);
            UpdateRated(course.id);
            course.number_of_reviewer = course.number_of_reviewer + 1;
            await review.save();
            await course.save();
        }
    } catch (e) {
        console.log(e);
    }
};
const ShowReviewList = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("ReviewList").exec();
    const list = course.ReviewList;
    return list;
};
/////// Chapters and Videos (TEACHERS)
///GET CHAPTER ID
const getChapterSpecs = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID);
    return chapter;
};
///GET VIDEO ID
const getVideoSpecs = async (VideoID) => {
    const video = await Videos.findById(VideoID);
    return video;
};
///ADD CHAPTER
const AddChapter = async (CourseID, ChapterName) => {
    const course = await Courses.findById(CourseID).populate("ChapterList").exec();
    const chapter = new Chapters({
        name: ChapterName,
        course: course.id,
    });
    course.ChapterList.concat(chapter.id);
    await chapter.save();
    await course.save();
};
///ADD VIDEO
const AddVideo = async (ChapterID, VideoName, url) => {
    const chapter = await Chapters.findById(ChapterID).populate("VideoList").exec();;
    const video = new Videos({
        name: VideoName,
        chapter: chapter.id,
        url: url,
    });
    chapter.VideoList.concat(video.id);
    await video.save();
    await chapter.save();
};
///MARK THIS CHAPTER AS DONE
const MarkChapterAsDone = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID);
    chapter.completed = true;
    await chapter.save();
};
///VIEW CHAPTER LIST
const viewChapterList = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("ChapterList").exec();;
    return course.ChapterList;
};
///VIEW VIDEO LIST
const viewVideoList = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID).populate("VideoList").exec();
    return chapter.VideoList;
};
///DELETE VIDEO
const DeleteVideo = async (VideoID) => {
    const video = await Videos.findById(VideoID);
    const chapter = await Chapters.findById(video.chapter).populate("VideoList").exec();
    const index = chapter.VideoList.indexOf(video.id);
    chapter.VideoList.splice(index, 1);
    await chapter.save();
    await Videos.findByIdAndDelete(VideoID);
};
///DELETE CHAPTER
const DeleteChapter = async (ChapterID) => {
    const chapter = await Chapters.findById(ChapterID);
    await Videos.deleteMany({chapter: chapter.id});
    const course = await Courses.findById(chapter.course).populate("ChapterList").exec();
    const index = course.ChapterList.indexOf(chapter.id);
    course.ChapterList.splice(index, 1);
    await course.save();
    await Chapters.findByIdAndDelete(chapter.id);
};
///REMOVE REGISTER LIST
const rmRegisList = async (StudentID, CourseID) => {
    const student = await Students.findById(StudentID).populate("CoursesRegistered").exec();
    const index = student.CoursesRegistered.indexOf(CourseID);
    student.CoursesRegistered.splice(index, 1);
    await student.save();
};
///REMOVE WATCH LIST
const rmWatchList = async (StudentID, CourseID) => {
    const student = await Students.findById(StudentID).populate("CoursesLiked").exec();
    const index = student.CoursesLiked.indexOf(CourseID);
    student.CoursesLiked.splice(index, 1);
    await student.save();
};
///DELETE COURSE
const DeleteCourse = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("ChapterList").populate("StudentsRegistered").populate("StudentsLiked").exec();
    course.ChapterList.forEach(async (element) => {
        await DeleteChapter(element.id);
    });
    Reviews.deleteMany({course: CourseID});
    course.StudentsRegistered.forEach(async (element) => {
        await rmRegisList(element);
    });
    course.StudentsLiked.forEach(async (element) => {
        await rmWatchList(element);
    });
    const teacher = await Teachers.findById(course.owner).populate("CoursesOwned").exec();
    const index = teacher.CoursesOwned.indexOf(CourseID);
    teacher.CoursesOwned.splice(index, 1);
    await teacher.save();

    await Courses.findByIdAndDelete(CourseID);
};
///SORT COURSE
const FetchCourseSortAs = async (attribute, status) => {
    let courses;
    if (attribute === "price")
        courses = await Courses.find().sort({price: status});
    if (attribute === "score")
        courses = await Courses.find().sort({score: status});
    if (attribute === "date")
        courses = await Courses.find().sort({createdAt: status});
    if (attribute === "student")
        courses = await Courses.find().sort({number_of_student: status});
    return courses;
};
const GetRelatedCourses = async (id) => {
    const course = await Courses.find({category: id}).sort({
        number_of_student: -1,
    });
    return course;
};
const CourseSortAs = async (arr, attribute, status) => {
    status === 1
        ? arr.sort((a, b) => a[attribute] - b[attribute])
        : arr.sort((a, b) => b[attribute] - a[attribute]);
    return arr;
};
///MARK COURSE AS DONE
const MarkCourseAsDone = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("ChapterList").exec();
    const check = course.ChapterList.every(
        (element) => element.completed === true
    );
    if (check) {
        course.completed = true;
    }
    await course.save();
};
///SEARCH COURSE
const searchCourseFullText = async (content) => {
    const courses = await Courses.find({
        $text: {
            $search: content,
            $caseSensitive: false,
            $diacriticSensitive: false,
        },
    });
    return courses;
};
/////CATEGORY MANAGEMENT
///GET CATEGORY NAME
const GetCateName = async (CourseID) => {
    const course = await Courses.findById(CourseID).populate("category").exec();
    return course.category;
};
///CHECK EXIST CATEGORY
const existCateName = async (CateName) => {
    const cates = await Cate.find();
    for (let index = 0; index < cates.length; index++) {
        const cate = cates[index];
        if (cate.name == CateName){
            console.log(cate.name);
            console.log(CateName);
            return true;
        }
    }
    return false;
};
///SHOW ALL CATEGORY
const ShowAllCategory = async () => {
    const cates = await Cate.find();
    return cates;
};
///SORT COURSE BY CATEGORY NAME
const FetchCourseByCateName = async (CategoryName) => {
    const cate = await Cate.findOne({name: CategoryName});
    const courses = await Courses.find({category: cate._id});
    return courses;
};
///DELETE CATEGORY
const DeleteCate = async (CategoryName) => {
    const cate = await Cate.findOne({name: CategoryName});
    await cate.delete();
};
///CHANGE CATEGORY NAME
const ChangeCateName = async (OldName, NewName) => {
    const cate = await Cate.findOne({name: OldName});
    cate.name = NewName;
    await cate.save();
};
///UPDATE COURSE DESCRIPTION
const UpdateDescription = async (CourseId, NewDesc) => {
    const course = await Courses.findById(CourseId);
    course.full_description = NewDesc;
    await course.save()
}
///UPDATE COURSE DETAIL
const UpdateCourseDetail = async (CourseId, avatar, Name, BriefDesc, Price, Status) => {
    const course = await Courses.findById(CourseId);
    course.name = Name;
    if (avatar != null) {
        const imageID = avatar.split("/")[5];
        const baseURl = "https://drive.google.com/thumbnail?id=" + imageID;
        course.avatar = baseURl;
    }
    course.brief_description = BriefDesc;
    course.price = Price;
    if (Status.trim() === "Completed") course.completed = true;
    else course.completed = false;
    await course.save();
};
// PUSH VIDEO INTO VIDEO LIST
const getbyCourseID = async(CourseID) =>{
    const chapters = await viewChapterList(CourseID);
    
    var videolist = [];
    for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const videos = await viewVideoList(chapter._id);
        
        
        videolist.push({_id : chapter._id,
            videos : videos});

    }
    return videolist;
}

const GetStarArr = (score) => {
    if (score - Math.floor(score) >= 0.25)
        score = Math.floor(score) + 0.5
    else score = Math.floor(score)
    let starList = []
    for (let i = 0; i < Math.floor(score); i++)
        starList.push("fa-star");
    if (Math.floor(score) !== score)
        starList.push("fa-star-half-full");
    for (let i = 0; i < 5 - Math.ceil(score); i++)
        starList.push("fa-star-o");
    return starList;
  }
  
  const GetPagination = (courses) => {
    let listPageCourses = [];
    let len = courses.length;
    let count = Math.floor(len / 4);
    for (let i = 0; i < count; i++)
        listPageCourses.push({id: i + 1, data: courses.slice(i * 4, i * 4 + 4)})
    if (len % 4 !== 0) {
        listPageCourses.push({id: count + 1, data: courses.slice(count * 4)})
        count++
    }
    return listPageCourses
  }
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
module.exports = {
    getCourseLecturer,
    getCoursesOwned,
    getStudentsRegistered,
    registerCourse,
    UnregisteredCourse,
    getCoursesRegistered,
    addtCourseToWatchList,
    ShowWatchList,
    RemoveCourseFromWatchList,
    AddCourseReview,
    ShowReviewList,
    getStudentSpecs,
    /// CHAPTER,VIDEO,COURSE
    AddChapter,
    AddVideo,
    viewChapterList,
    viewVideoList,
    MarkChapterAsDone,
    DeleteVideo,
    DeleteChapter,
    DeleteCourse,
    getChapterSpecs,
    getbyCourseID,
    ///CHECK
    isLiked,
    isReviewed,
    isRegistered,
    //SORT COURSE
    FetchCourseSortAs, //1 for asc, -1 for desc.
    //COMPLETE COURSE
    MarkCourseAsDone,
    //SEARCH
    searchCourseFullText,
    //CATEGORY
    GetCateName,
    ShowAllCategory,
    FetchCourseByCateName,
    DeleteCate,
    ChangeCateName,
    existCateName,
    //UPDATE DESCRIPTION
    UpdateDescription,
    UpdateCourseDetail,
    CourseSortAs,
    GetRelatedCourses,
    GetStarArr,
    GetPagination,
    getRandomInt,
};