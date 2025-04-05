import { useState, useEffect } from 'react'
import './App.css'
import { Book, Home, User, BarChart, Settings, Search, LogIn, Flame } from 'lucide-react'
import { courseService, pathService, authService } from './services/api'

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
      setUserCourses(userCoursesData)
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
      '2023-10-05'
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

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')

    try {
      const userData = await authService.login(username, password)
      setUser(userData)
      console.log('Logged in successfully as:', userData.username)
    } catch (error) {
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

  if (loading) {
    return <div className="loading">Loading...</div>
  }

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
    )
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
            <div className="avatar">
              {user.first_name ? user.first_name[0] : user.username[0]}
              {user.last_name ? user.last_name[0] : ''}
            </div>
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
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map((course) => (
                    <div key={course.id} className="course-card">
                      <div className="course-image">
                        {courseImageMap[course.title] ? (
                          <img
                            src={courseImageMap[course.title].default}
                            alt={course.title}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              backgroundColor: course.image_color || `hsl(${course.id * 60}, 70%, 80%)`,
                              height: '150px',
                              borderRadius: '8px',
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="course-content">
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <div className="course-meta">
                          <span>{course.rating} ★</span>
                          <span>{course.difficulty}</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Loading recommended courses...</p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="content">
            <h1>Courses</h1>
            <p className="subtitle">Explore a variety of courses tailored to your interests</p>

            <div className="course-grid">
              {recommendedCourses.length > 0 ? (
                recommendedCourses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-image">
                      {courseImageMap[course.title] ? (
                        <img
                          src={courseImageMap[course.title].default}
                          alt={course.title}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            borderRadius: '8px',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: course.image_color || `hsl(${course.id * 60}, 70%, 80%)`,
                            height: '150px',
                            borderRadius: '8px',
                          }}
                        ></div>
                      )}
                    </div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="course-meta">
                        <span>{course.rating} ★</span>
                        <span>{course.difficulty}</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Loading courses...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App