import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Line } from 'rc-progress';
import footer from '../../components/student/Footer'
import Footer from '../../components/student/Footer';
const MyEnrollments = () => {
  const navigate = useNavigate();
  const { enrolledCourses, calculateCourseDuration } = useContext(AppContext);

  const [progressArray] = useState([
    { lectureCompleted: 2, totalLectures: 4 },
    { lectureCompleted: 1, totalLectures: 5 },
    { lectureCompleted: 3, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 3 },
    { lectureCompleted: 5, totalLectures: 7 },
    { lectureCompleted: 6, totalLectures: 8 },
    { lectureCompleted: 2, totalLectures: 6 },
    { lectureCompleted: 4, totalLectures: 10 },
    { lectureCompleted: 3, totalLectures: 5 },
    { lectureCompleted: 7, totalLectures: 7 },
    { lectureCompleted: 1, totalLectures: 4 },
    { lectureCompleted: 0, totalLectures: 2 },
    { lectureCompleted: 5, totalLectures: 5 },
  ]);

  const handleCompletedClick = (course) => {
    console.log(`Viewing completed course: ${course.courseTitle}`);
    navigate(`/player/${course._id}`);
  };

  const handleOngoingClick = (course) => {
    console.log(`Continuing course: ${course.courseTitle}`);
    navigate(`/player/${course._id}`);
  };

  return (
    <>
    <div className="md:px-36 px-8 pt-10">
      <h1 className="text-2xl font-semibold">My Enrollments</h1>

      <div className="overflow-x-auto mt-10">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100 text-sm text-left text-gray-900">
            <tr>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Completed</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-5 text-center text-gray-500">
                  No enrollments yet.
                </td>
              </tr>
            ) : (
              enrolledCourses.map((course, index) => {
                const progress = progressArray[index];
                const isCompleted =
                  progress && progress.lectureCompleted === progress.totalLectures;

                const percent =
                  progress && progress.totalLectures > 0
                    ? Math.round(
                        (progress.lectureCompleted / progress.totalLectures) * 100
                      )
                    : 0;

                return (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <img
                            src={course.courseThumbnail}
                            alt={course.courseTitle}
                            className="w-14 sm:w-24 md:w-28 rounded object-cover"
                          />
                          <p className="text-sm font-medium">{course.courseTitle}</p>
                        </div>
                        <div className="mt-2 w-full md:w-2/3">
                          <Line
                            percent={percent}
                            strokeWidth={4}
                            strokeColor={isCompleted ? '#22c55e' : '#facc15'}
                            trailWidth={4}
                            trailColor="#e5e7eb"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {calculateCourseDuration(course)}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {progress
                        ? `${progress.lectureCompleted} / ${progress.totalLectures}`
                        : '0 / 0'}{' '}
                      <span className="text-gray-500">Lectures</span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() =>
                          isCompleted
                            ? handleCompletedClick(course)
                            : handleOngoingClick(course)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold 
                          ${isCompleted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {isCompleted ? 'Completed' : 'On Going'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    <Footer/>
    
    </>
  );
};

export default MyEnrollments;
