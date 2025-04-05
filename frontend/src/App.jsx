import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { courseService, pathService, authService } from './services/api'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { Sidebar } from './components/navigation/Sidebar'
import { Header } from './components/navigation/Header'
import { HomePage } from './components/pages/HomePage'
import Chatbot from './components/chatbot/chatbot'
import { Book, Home, User, BarChart, Settings, Search, Bookmark, Award, MessageCircle, X } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [userCourses, setUserCourses] = useState([])
  const [learningPaths, setLearningPaths] = useState([])
  const [isChatbotVisible, setIsChatbotVisible] = useState(false)

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
  
  async function handleLogin(username, password) {
    try {
      const userData = await authService.login(username, password);
      setUser(userData);
      console.log('Logged in successfully as:', userData.username);
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
    }
  }
  
  async function handleLogout() {
    try {
      await authService.logout();
      setUser(null);
      setIsChatbotVisible(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const toggleChatbot = () => {
    setIsChatbotVisible(!isChatbotVisible);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
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
              <Header 
                user={user} 
                onToggleChat={toggleChatbot}
              />
              {activeTab === 'home' && (
                <HomePage 
                  user={user}
                  recommendedCourses={recommendedCourses}
                  learningPaths={learningPaths}
                />
              )}
              {/* Other tab content will be added here */}
              {!isChatbotVisible && (
                <button className="chat-toggle" onClick={toggleChatbot}>
                  <MessageCircle size={24} />
                </button>
              )}
              {isChatbotVisible && (
                <Chatbot 
                  initialMessage={`Hi, I'm here to help you with your learning journey. 
                    Your current progress: 
                    - Course: ${userCourses[0]?.title || 'No active course'}
                    - Progress: ${userCourses[0]?.progress || 0}%
                    What would you like to know?`}
                  onClose={toggleChatbot}
                />
              )}
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterForm onRegister={handleRegister} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App