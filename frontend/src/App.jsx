import { useState, useEffect } from 'react'
import './App.css'
import { Book, Home, User, BarChart, Settings, Search, LogIn } from 'lucide-react'
import { courseService, pathService, authService } from './services/api'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [userCourses, setUserCourses] = useState([])
  const [learningPaths, setLearningPaths] = useState([])
  
  // Login form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        console.log('Checking auth status...');
        
        // Check if we have stored credentials
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          console.log('Auth successful:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.log('Auth failed:', error);
        console.log('User not authenticated');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthStatus();
  }, []);
  
  // Fetch data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  
  async function fetchData() {
    try {
      // Fetch all required data in parallel
      const [recommendedData, userCoursesData, pathsData] = await Promise.all([
        courseService.getRecommended(),
        courseService.getUserCourses(),
        pathService.getUserPaths()
      ]);
      
      setRecommendedCourses(recommendedData);
      setUserCourses(userCoursesData);
      setLearningPaths(pathsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    
    try {
      const userData = await authService.login(username, password);
      setUser(userData);
      console.log('Logged in successfully as:', userData.username);
    } catch (error) {
      setLoginError('Invalid username or password');
      console.log(error);
    }
  }
  
  async function handleLogout() {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  if (loading) {
    return <div className="loading">Loading...</div>;
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
                {recommendedCourses.length > 0 ? recommendedCourses.map((course) => (
                  <div key={course.id} className="course-card">
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

        {activeTab !== 'home' && (
          <div className="content placeholder-content">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>This section is under development for the hackathon demo.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App