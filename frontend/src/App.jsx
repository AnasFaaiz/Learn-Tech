import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Book, Home, User, BarChart, Settings, Search, LogIn, Flame, LogOut } from 'lucide-react'
import { courseService, pathService, authService } from './services/api'

import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { Sidebar } from './components/navigation/Sidebar'
import { Header } from './components/navigation/Header'
import { HomePage } from './components/pages/HomePage'

import CourseView from './components/CourseView/CourseView'
import Profile from './components/Profile/Profile' // Add this import

// Dynamically import all images from the img folder
const courseImages = import.meta.glob('./img/*.png', { eager: true })

// Map course titles to their respective images
const courseImageMap = {
  'Modern JavaScript Fundamentals': courseImages['./img/Modern_JS.png'],
  'React.js: Zero to Expert': courseImages['./img/React_JS.png'],
  'Full-Stack Development with MERN': courseImages['./img/FullStack.png'],
  'CSS Mastery: Advanced Layouts': courseImages['./img/CSS.png'],
}


function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [userCourses, setUserCourses] = useState([])
  const [learningPaths, setLearningPaths] = useState([])

  

  const [streak, setStreak] = useState(0) // Streak state
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('profileImage') || null;
  });

  // Login form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')


  useEffect(() => {
    async function checkAuthStatus() {
      try {
        console.log('Checking auth status...')
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser()
          console.log('Auth successful:', userData)
          setUser(userData)
        }
      } catch (error) {
        console.log('Auth failed:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
      calculateStreak() // Calculate streak when user data is available
    }
  }, [user])

  async function fetchData() {
    try {
      const [recommendedData, userCoursesData, pathsData] = await Promise.all([
        courseService.getRecommended(),
        courseService.getUserCourses(),
        pathService.getUserPaths()
      ])

      setRecommendedCourses(recommendedData)
      setUserCourses(userCoursesData.map(course => ({
        ...course,
        progress: course.progress || 0,
        is_completed: course.progress === 100,
        last_accessed: course.last_accessed || new Date().toISOString()
      })))
      setLearningPaths(pathsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Function to calculate streak
  function calculateStreak() {
    // Mock streak calculation logic
    const lastActiveDates = [
      '2023-10-01',
      '2023-10-02',
      '2023-10-03',
      '2023-10-04',
      '2023-10-05',
    ] // Replace with actual data from the backend
    const today = new Date().toISOString().split('T')[0]
    let currentStreak = 0
    for (let i = lastActiveDates.length - 1; i >= 0; i--) {
      const date = new Date(lastActiveDates[i])
      const diff = (new Date(today) - date) / (1000 * 60 * 60 * 24)
      if (diff === currentStreak) {
        currentStreak++
      } else {
        break
      }
    }
    setStreak(currentStreak)
  }

  
  async function handleLogin(username, password) {


  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')

    try {
      const userData = await authService.login(username, password)
      setUser(userData)
      console.log('Logged in successfully as:', userData.username)
    } catch (error) {

      throw error;
    }
  }

  async function handleRegister(formData) {
    try {
      await authService.register(formData);
      console.log('Registration successful');
    } catch (error) {
      throw error;

      setLoginError('Invalid username or password')
      console.log(error)

    }
  }

  async function handleLogout() {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
  }

  const handleBackFromCourse = () => {
    setSelectedCourseId(null);
  }

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleViewProfile = () => {
    setActiveTab('profile');
    setIsProfileDropdownOpen(false);
    setSelectedCourseId(null);
  };

  const handleProfileImageUpdate = (newImage) => {
    setProfileImage(newImage);
    // Store in localStorage for persistence
    localStorage.setItem('profileImage', newImage);
  };

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  
  return (
    <Router>
      <div className="app-container">
        {user ? (
          <>
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onLogout={handleLogout} 
            />
            <div className="main-content">
              <Header user={user} />
              {activeTab === 'home' && (
                <HomePage 
                  user={user}
                  recommendedCourses={recommendedCourses}
                  learningPaths={learningPaths}
                />
              )}
              {/* Other tab content will be added here */}
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>


  if (!user) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>LearnTech</h1>
          <p>AI-Powered Personalized Learning Platform</p>
          {loginError && <div className="error-message">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              <LogIn size={18} />
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If a course is selected, show the course view
  if (selectedCourseId) {
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
              onClick={() => {
                setActiveTab('home')
                setSelectedCourseId(null)
              }}
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('courses')
                setSelectedCourseId(null)
              }}
            >
              <Book size={20} />
              <span>Courses</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('progress')
                setSelectedCourseId(null)
              }}
            >
              <BarChart size={20} />
              <span>My Progress</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile')
                setSelectedCourseId(null)
              }}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('settings')
                setSelectedCourseId(null)
              }}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </nav>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
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
              <span className="user-name">{user.first_name || user.username}</span>
              <div 
                className="avatar" 
                onClick={handleProfileClick}
                role="button"
                tabIndex={0}
                style={{
                  backgroundColor: profileImage ? 'transparent' : 'var(--primary-light)',
                  backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!profileImage && (
                  <>{user.first_name ? user.first_name[0] : user.username[0]}
                  {user.last_name ? user.last_name[0] : ''}</>
                )}
              </div>
              
              {isProfileDropdownOpen && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={handleViewProfile}>
                    <User size={16} />
                    View Profile
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>
          {/* Course View */}
          <CourseView
            courseId={selectedCourseId}
            onBackClick={handleBackFromCourse}
          />
        </div>
      </div>
    );
  }

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

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
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
            <span className="user-name">{user.first_name || user.username}</span>
            <div 
              className="avatar" 
              onClick={handleProfileClick}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: profileImage ? 'transparent' : 'var(--primary-light)',
                backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!profileImage && (
                <>{user.first_name ? user.first_name[0] : user.username[0]}
                {user.last_name ? user.last_name[0] : ''}</>
              )}
            </div>
            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleViewProfile}>
                  <User size={16} />
                  View Profile
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        {activeTab === 'home' && (
          <div className="content">
            <h1>Welcome back, {user.first_name || user.username}!</h1>
            <p className="subtitle">Pick up where you left off or explore new topics</p>

            <section className="recommended-section">
              <div className="section-header">
                <h2>Recommended for You</h2>
                <button className="see-all">See All</button>
              </div>
              <div className="course-grid">
                {recommendedCourses.length > 0 ? recommendedCourses.map((course) => (
                  <div key={course.id} className="course-card" onClick={() => handleCourseSelect(course.id)}>
                    <div className="course-image"
                      style={{backgroundColor: course.image_color || `hsl(${course.id * 60}, 70%, 80%)`}}
                    ></div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p>{course.description.substring(0, 80)}...</p>
                      <div className="course-meta">
                        <span>{course.rating} ★</span>
                        <span>{course.difficulty}</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p>Loading recommended courses...</p>
                )}
              </div>
            </section>

            <section className="learning-path-section">
              <div className="section-header">
                <h2>Your Learning Path</h2>
                <button className="see-all">View Details</button>
              </div>
              <div className="learning-path">
                {learningPaths.length > 0 && learningPaths[0]?.milestones ? (
                  <div className="path-progress">
                    <div className="path-line"></div>
                    {learningPaths[0].milestones.map((milestone, index) => (
                      <div key={milestone.id}
                        className={`milestone ${milestone.is_completed ? 'completed' : index === 0 ? 'current' : ''}`}
                      >
                        <div className="milestone-dot"></div>
                        <div className="milestone-content">
                          <h4>{milestone.title}</h4>
                          <p>{milestone.is_completed
                            ? `Completed on ${new Date(milestone.completed_date).toLocaleDateString()}`
                            : index === 0 ? 'In progress' : 'Not started yet'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No learning path available. Create one to start tracking your progress!</p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="content">
            <h1>Courses</h1>
            <p className="subtitle">Browse all available courses or search for specific topics</p>

            <div className="course-categories">
              <button className="category-btn active">All Courses</button>
              <button className="category-btn">Web Development</button>
              <button className="category-btn">Data Science</button>
              <button className="category-btn">Mobile Development</button>
              <button className="category-btn">DevOps & Cloud</button>
              <button className="category-btn">Cybersecurity</button>
            </div>
            
            <div className="course-grid">
              {recommendedCourses.length > 0 ? recommendedCourses.map((course) => (
                <div key={course.id} className="course-card" onClick={() => handleCourseSelect(course.id)}>
                  <div className="course-image" 
                    style={{backgroundColor: course.image_color || `hsl(${course.id * 60}, 70%, 80%)`}}
                  ></div>
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p>{course.description.substring(0, 80)}...</p>
                    <div className="course-meta">
                      <span>{course.rating} ★</span>
                      <span>{course.difficulty}</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p>No courses to show.</p>
              )}
            </div>
          </div>
        )}

        {(activeTab !== 'home' && activeTab !== 'courses') && (
          <div className="content">
            {activeTab === 'profile' ? (
              <Profile 
                user={user} 
                userCourses={userCourses} 
                profileImage={profileImage}
                onProfileImageUpdate={handleProfileImageUpdate}
              />
            ) : (
              <div className="placeholder-content">
                <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                <p>This section is under development.</p>
              </div>
            )}
          </div>

        )}
      </div>
    </Router>
  )
}

export default App