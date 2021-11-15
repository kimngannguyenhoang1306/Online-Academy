const adminRouter = require('./AdminRouter');
const teacherRouter = require('./TeacherRouter');
const courseRouter = require('./CourseRouter');
const testRouter = require('./TestRouter');
const userRouter = require('./UserRouter');
function route(app) {
    app.use('/admin',adminRouter);
    app.use('/teacher',teacherRouter);
    app.use('/course',courseRouter);
    app.use('/ttest',testRouter);
    app.use('/',userRouter);
    
}

module.exports = route;