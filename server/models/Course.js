import mongoose from "mongoose";

// Lecture Schema
const lectureSchema = new mongoose.Schema({
  lectureId: { type: String, required: true },
  lectureTitle: { type: String, required: true },
  lectureDuration: { type: Number, required: true }, // duration in minutes
  lectureUrl: { type: String, required: true },
  isPreviewFree: { type: Boolean, required: true },
  lectureOrder: { type: Number, required: true }
}, { _id: false });

// Chapter Schema
const chapterSchema = new mongoose.Schema({
  chapterId: { type: String, required: true },
  chapterOrder: { type: Number, required: true },
  chapterTitle: { type: String, required: true },
  chapterContent: [lectureSchema]
}, { _id: false });

// Course Schema
const courseSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  courseDescription: { type: String, required: true },
  courseThumbnail: { type: String }, // Cloudinary URL
  coursePrice: { type: Number, required: true },
  discount: { type: Number, required: true, min: 0, max: 100 },
  isPublished: { type: Boolean, default: true },

  courseContent: [chapterSchema],

  courseRatings: [
    {
      userId: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 }
    }
  ],

  educator: { type: String, ref: "User", required: true }, // user ID reference
  educatorName: { type: String, required: true }, // denormalized name
  enrolledStudents: [{ type: String, ref: "User" }]
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;
