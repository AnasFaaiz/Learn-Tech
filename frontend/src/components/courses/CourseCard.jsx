export const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <div className="course-image" 
        style={{backgroundColor: course.image_color || `hsl(${course.id * 60}, 70%, 80%)`}}
      ></div>
      <div className="course-content">
        <span className="course-tag">AI Recommended</span>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <span>{course.rating} ★</span>
          <span>{course.difficulty}</span>
          <span>{course.duration}</span>
        </div>
        <div className="course-progress">
          <div className="progress-bar">
            <div className="progress" style={{width: `0%`}}></div>
          </div>
          <span>Not started yet</span>
        </div>
      </div>
    </div>
  );
}; 