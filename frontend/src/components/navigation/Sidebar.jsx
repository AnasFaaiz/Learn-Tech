import { Home, Book, BarChart, User, Settings } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
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
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </div>
  );
}; 