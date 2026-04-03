const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

/**
 * GET /api/timetable/:courseId
 *
 * Generates a personalized day-by-day study timetable for the authenticated
 * user based on:
 *  - Number of lessons in the course
 *  - User's login streak (consistency score)
 *  - Standard 30-min lesson assumption
 *  - Adaptive daily study load (beginner → 1 lesson/day, intermediate → 2,
 *    advanced → 3), boosted by streak
 */
exports.generateTimetable = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId
    });
    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled in this course" });
    }

    // Already completed
    if (enrollment.progressPercent === 100) {
      return res.json({
        course: { title: course.title, difficulty: course.difficulty },
        completed: true,
        message: "Congratulations! You have completed this course."
      });
    }

    const totalLessons = course.lessons.length || 5; // fallback
    const streak = req.user.streak || 0;

    // Base lessons per day by difficulty
    const baseMap = { beginner: 1, intermediate: 2, advanced: 3 };
    let lessonsPerDay = baseMap[course.difficulty] || 1;

    // Boost up to +1 lesson/day if streak >= 7
    if (streak >= 7) lessonsPerDay = Math.min(lessonsPerDay + 1, 5);

    // How many lessons remain
    const completedLessons = course.lessons.filter((lesson) => {
      return enrollment.progress.get(lesson._id.toString()) === true;
    }).length;

    const remainingLessons = Math.max(totalLessons - completedLessons, 0);

    if (remainingLessons === 0) {
      return res.json({
        course: { title: course.title, difficulty: course.difficulty },
        completed: true,
        message: "Congratulations! You have completed this course."
      });
    }

    // Build the timetable
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = [];
    let dayOffset = 0;
    let lessonsScheduled = 0;
    const lessonList = course.lessons.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

    while (lessonsScheduled < remainingLessons) {
      const day = new Date(today);
      day.setDate(today.getDate() + dayOffset);

      // Skip Sundays as a default weekly rest day to improve long-term retention
      if (day.getDay() !== 0) {
        const dayLessons = [];
        for (let i = 0; i < lessonsPerDay && lessonsScheduled < remainingLessons; i++) {
          const lessonIndex = completedLessons + lessonsScheduled;
          const lesson = lessonList[lessonIndex];
          dayLessons.push({
            title: lesson ? lesson.title : `Lesson ${lessonIndex + 1}`,
            estimatedMinutes: 30
          });
          lessonsScheduled++;
        }

        schedule.push({
          date: day.toISOString().split("T")[0],
          day: day.toLocaleDateString("en-US", { weekday: "long" }),
          lessons: dayLessons,
          totalMinutes: dayLessons.length * 30
        });
      }

      dayOffset++;
    }

    const estimatedCompletionDate = schedule.length > 0
      ? schedule[schedule.length - 1].date
      : today.toISOString().split("T")[0];

    res.json({
      course: {
        title: course.title,
        difficulty: course.difficulty,
        totalLessons,
        completedLessons
      },
      streak,
      lessonsPerDay,
      remainingLessons,
      estimatedCompletionDate,
      schedule
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
