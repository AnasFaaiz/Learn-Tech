import { useState } from 'react'
import './App.css'
import { Book, Home, User, BarChart, Settings, Search, Bookmark, Award, MessageCircle, X } from 'lucide-react'
import Chatbot from './components/chatbot'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState('')

  const handleRecommendClick = () => {
    setIsChatOpen(true);
    setInitialMessage('Analyze my learning progress');
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
            
            <section className="recommended-section">
              <div className="section-header">
                <h2>Recommended for You</h2>
                <button className="see-all">See All</button>
              </div>
              <div className="course-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="course-card">
                    <div className="course-image" style={{backgroundColor: `hsl(${item * 60}, 70%, 80%)`}}></div>
                    <div className="course-content">
                      <span className="course-tag">AI Recommended</span>
                      <h3>Machine Learning Basics {item}</h3>
                      <p>Learn the fundamentals of machine learning algorithms and implementation.</p>
                      <div className="course-meta">
                        <span>4.9 ★</span>
                        <span>Intermediate</span>
                        <span>8h 30m</span>
                      </div>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div className="progress" style={{width: `${20 * item}%`}}></div>
                        </div>
                        <span>{20 * item}% complete</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="learning-path-section">
              <div className="section-header">
                <h2>Your Learning Path</h2>
                <button className="see-all">View Details</button>
              </div>
              <div className="learning-path">
                <div className="path-progress">
                  <div className="path-line"></div>
                  <div className="milestone completed">
                    <div className="milestone-dot"></div>
                    <div className="milestone-content">
                      <h4>Programming Fundamentals</h4>
                      <p>Completed on May 15, 2023</p>
                    </div>
                  </div>
                  <div className="milestone current">
                    <div className="milestone-dot"></div>
                    <div className="milestone-content">
                      <h4>Data Structures & Algorithms</h4>
                      <p>In progress - 65% complete</p>
                    </div>
                  </div>
                  <div className="milestone">
                    <div className="milestone-dot"></div>
                    <div className="milestone-content">
                      <h4>Advanced AI Concepts</h4>
                      <p>Unlocks after current milestone</p>
                    </div>
                  </div>
                </div>
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

      <div className="chatbot-container">
      <button 
        className="chat-toggle"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chatbot Component */}
      {isChatOpen && (
        <div className="chatbot-wrapper">
          <Chatbot initialMessage={initialMessage} />
        </div>
      )}
      </div>

      <div className="Recommendations">
        <button 
          className="recommend-course"
          onClick={handleRecommendClick}
        >
          <Award size={18} />
          Recommend
        </button>
      </div>
    </div>
  )
}

export default App;