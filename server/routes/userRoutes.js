import express from 'express';
import { getUserData, purchaseCourse, userEnrolledCourses, updateCourseProgress, getCourseProgress, addUserRating } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);
userRouter.post('/purchase', purchaseCourse);
userRouter.post('/update-course-progress', updateCourseProgress);
userRouter.post('/get-course-progress', getCourseProgress);
userRouter.post('/add-rating', addUserRating);


export default userRouter;


