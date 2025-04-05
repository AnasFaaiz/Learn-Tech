import { useState } from 'react';
import './App.css';
import { Book, Home, User, BarChart, Settings, Search, Award, X } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [learningPath, setLearningPath] = useState([
    {
      id: 1,
      title: 'Programming Fundamentals',
      status: 'completed',
      description: 'Completed on May 15, 2023',
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms',
      status: 'current',
      description: 'In progress - 65% complete',
    },
    {
      id: 3,
      title: 'Advanced AI Concepts',
      status: 'upcoming',
      description: 'Unlocks after completing "Data Structures & Algorithms"',
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [courses] = useState([
    {
      id: 4,
      title: 'Machine Learning Basics',
      description: 'Learn the fundamentals of machine learning algorithms.',
      image: 'https://via.placeholder.com/300x200',
      tag: 'AI Recommended',
      rating: '4.9 ★',
      level: 'Intermediate',
      duration: '8h 30m',
      progress: 0,
    },
    {
      id: 5,
      title: 'Deep Learning with TensorFlow',
      description: 'Master deep learning concepts and TensorFlow.',
      image: 'https://via.placeholder.com/300x200',
      tag: 'AI Recommended',
      rating: '4.8 ★',
      level: 'Advanced',
      duration: '12h 45m',
      progress: 0,
    },
    ...Array.from({ length: 40 }, (_, i) => ({
      id: i + 6,
      title: `Course ${i + 6}`,
      description: `Description for Course ${i + 6}`,
      image: 'https://via.placeholder.com/300x200',
      tag: i % 2 === 0 ? 'Popular' : 'New',
      rating: `${(Math.random() * 1 + 4).toFixed(1)} ★`,
      level: i % 3 === 0 ? 'Beginner' : i % 3 === 1 ? 'Intermediate' : 'Advanced',
      duration: `${Math.floor(Math.random() * 10) + 5}h ${Math.floor(Math.random() * 60)}m`,
      progress: 0,
    })),
  ]);

  const recommendedCourses = courses.filter(
    (course) => course.tag === 'AI Recommended' && !learningPath.some((pathCourse) => pathCourse.id === course.id)
  );

  const allCourses = courses.filter(
    (course) => !learningPath.some((pathCourse) => pathCourse.id === course.id)
  );

  const handleAddCourse = (courseId) => {
    const isAlreadyAdded = learningPath.some((course) => course.id === courseId);
    if (isAlreadyAdded) {
      alert('This course is already in your learning path!');
      return;
    }

    const selectedCourse = courses.find((course) => course.id === courseId);
    if (selectedCourse) {
      setLearningPath((prevPath) => [
        ...prevPath,
        {
          id: selectedCourse.id,
          title: selectedCourse.title,
          status: 'upcoming',
          description: selectedCourse.description,
        },
      ]);
    }
  };

  const handleRemoveCourse = (courseId) => {
    setLearningPath((prevPath) => prevPath.filter((course) => course.id !== courseId));
  };

  const handleOpenCourse = (courseId) => {
    const course = learningPath.find((course) => course.id === courseId);
    if (course) {
      alert(`Opening course: ${course.title}`);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const calculateProgress = () => {
    const totalCourses = learningPath.length;
    const completedCourses = learningPath.filter((course) => course.status === 'completed').length;
    const currentCourseIndex = learningPath.findIndex((course) => course.status === 'current');
    return ((completedCourses + (currentCourseIndex !== -1 ? 0.5 : 0)) / totalCourses) * 100;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>LearnTech</h2>
        </div>
        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <Book size={20} />
            <span>Courses</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <BarChart size={20} />
            <span>My Progress</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Award size={20} />
            <span>Achievements</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search for courses, topics, or skills..." />
          </div>
          <div className="user-profile">
            <span className="user-name">John Doe</span>
            <div className="avatar">JD</div>
          </div>
        </header>

        {/* Content Area */}
        {activeTab === 'home' && (
          <div className="content">
            <h1>Welcome back, John!</h1>
            <p className="subtitle">Pick up where you left off or explore new topics</p>

            {/* Recommended Courses Section */}
            <section className="recommended-section">
              <div className="section-header">
                <h2>Recommended for You</h2>
                <button className="see-all">See All</button>
              </div>
              <div className="course-grid">
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div
                      className="course-image"
                      style={{
                        backgroundImage: `url(${course.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div className="course-content">
                      <span className="course-tag">{course.tag}</span>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="course-meta">
                        <span>{course.rating}</span>
                        <span>{course.level}</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Learning Path Section */}
            <section className="learning-path-section">
              <div className="section-header">
                <h2>Your Learning Path</h2>
                <button className="add-course-btn" onClick={toggleModal}>
                  Add Course
                </button>
              </div>
              <div className="learning-path">
                <div className="path-progress">
                  <div
                    className="path-fill"
                    style={{ height: `${calculateProgress()}%` }}
                  ></div>
                </div>
                {learningPath.map((milestone) => (
                  <div key={milestone.id} className={`milestone ${milestone.status}`}>
                    <div className="milestone-dot"></div>
                    <div className="milestone-content">
                      <h4>{milestone.title}</h4>
                      <p>{milestone.description}</p>
                      <div className="milestone-actions">
                        <button
                          className="open-course-btn"
                          onClick={() => handleOpenCourse(milestone.id)}
                        >
                          Open
                        </button>
                        <button
                          className="remove-course-btn"
                          onClick={() => handleRemoveCourse(milestone.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab !== 'home' && (
          <div className="content placeholder-content">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>This section is under development for the hackathon demo.</p>
          </div>
        )}
      </div>

      {/* Modal for Adding Courses */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add a Course</h2>
              <button className="close-modal-btn" onClick={toggleModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              {/* AI Recommended Courses */}
              <div className="modal-section">
                <h3>AI Recommended Courses</h3>
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="modal-course">
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                    <button onClick={() => handleAddCourse(course.id)}>Add</button>
                  </div>
                ))}
              </div>

              {/* All Courses */}
              <div className="modal-section">
                <h3>All Courses</h3>
                {allCourses.map((course) => (
                  <div key={course.id} className="modal-course">
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                    <button onClick={() => handleAddCourse(course.id)}>Add</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;