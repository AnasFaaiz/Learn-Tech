import { CourseGrid } from '../courses/CourseGrid';

export const HomePage = ({ user, recommendedCourses, learningPaths }) => {
  return (
    <div className="content">
      <h1>Welcome back, {user.first_name || user.username}!</h1>
      <p className="subtitle">Pick up where you left off or explore new topics</p>
      
      <section className="recommended-section">
        <div className="section-header">
          <h2>Recommended for You</h2>
          <button className="see-all">See All</button>
        </div>
        <CourseGrid courses={recommendedCourses} />
      </section>

      <section className="learning-path-section">
        <div className="section-header">
          <h2>Your Learning Path</h2>
          <button className="see-all">View Details</button>
        </div>
        <div className="learning-path">
          {learningPaths.length > 0 && learningPaths[0]?.milestones ? (
            <div className="path-progress">
              {learningPaths[0].milestones.map((milestone, index) => (
                <div key={milestone.id} className="milestone">
                  <div className="milestone-content">
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading learning path...</p>
          )}
        </div>
      </section>
    </div>
  );
}; 