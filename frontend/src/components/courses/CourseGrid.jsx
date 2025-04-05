import { CourseCard } from './CourseCard';

export const CourseGrid = ({ courses }) => {
  return (
    <div className="course-grid">
      {courses.length > 0 ? courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      )) : (
        <p>Loading courses...</p>
      )}
    </div>
  );
}; 