import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import YouTube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';

const Player = () => {
  const { enrolledCourses, calculateChapterTime } = useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const getCourseData = () => {
    const course = enrolledCourses.find((course) => course._id === courseId);
    if (course) {
      setCourseData(course);
    }
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isYouTubeLink = (url) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const extractYouTubeId = (url) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  useEffect(() => {
    getCourseData();
  }, [courseId, enrolledCourses]);

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left column: Course Structure */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-5">
            {courseData?.courseContent?.map((chapter, index) => (
              <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className={`transform transition-transform ${
                        openSections[index] ? 'rotate-180' : ''
                      }`}
                      src={assets.down_arrow_icon}
                      alt="arrow icon"
                    />
                    <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                  </div>
                  <p className="text-sm md:text-default">
                    {chapter.chapterContent.length} lectures – {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSections[index] ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={false ? assets.blue_tick_icon : assets.play_icon}
                          alt="play icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                onClick={() =>
                                  setPlayerData({
                                    ...lecture,
                                    chapter: index + 1,
                                    lecture: i + 1,
                                  })
                                }
                                className="text-blue-500 cursor-pointer"
                              >
                                Watch
                              </p>
                            )}
                            <p>
                              {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                units: ['h', 'm'],
                              })}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className='flex items-center gap-2 py-3 mt -10'>
            <h1 className='text-xl font-bold'>Rate this Course:</h1>
            <Rating initialRating={0}/>
          </div>
        </div>

        {/* Right column: Video Player */}
        <div className="flex flex-col gap-4 items-center bg-gray-100 rounded-md p-4">
          {playerData ? (
            <>
              {isYouTubeLink(playerData.lectureUrl) ? (
                <YouTube
                  videoId={extractYouTubeId(playerData.lectureUrl)}
                  iframeClassName="w-full aspect-video rounded-md"
                />
              ) : (
                <video
                  key={playerData.lectureUrl}
                  controls
                  className="w-full rounded-md max-h-[480px]"
                >
                  <source src={playerData.lectureUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              <div className="w-full">
                <p className="font-semibold text-gray-800 mb-2">
                  Chapter {playerData.chapter}, Lecture {playerData.lecture}: {playerData.lectureTitle}
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  {false ? 'completed':'mark Completed'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 text-center w-full h-full">
              {courseData?.courseThumbnail ? (
                <img
                  src={courseData.courseThumbnail}
                  alt="Course Thumbnail"
                  className="rounded w-full max-h-72 object-cover"
                />
              ) : (
                <p>Select a lecture to start watching</p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Player;
