import { createContext, useEffect, useState } from 'react';
import { dummyCourses } from '../assets/assets';
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from '@clerk/clerk-react'

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY;
    

    const {getToken} = useAuth()
    const {user} = useUser()


    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    // Fetch all courses
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    };

    // Function to calculate chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.forEach((lecture) => {
            time += lecture.lectureDuration;
        });
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    // Function to calculate total course duration
    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseContent.forEach((chapter) => {
            chapter.chapterContent.forEach((lecture) => {
                time += lecture.lectureDuration;
            });
        });
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    // Function to calculate total number of lectures
    const calculateNoOfLecture = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    // Fetch user enrolled courses
    const fetchUserEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses);
    };

    useEffect(() => {
        fetchAllCourses();
        fetchUserEnrolledCourses();
    }, []);


    const logToken = async()=>{
        console.log(await getToken());
    }


    useEffect(()=>{
        if(user){
            logToken()
        }
    },[user])




    const value = {
        currency,
        allCourses,
        enrolledCourses,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLecture,
        fetchUserEnrolledCourses
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
