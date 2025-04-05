import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    preferences: {
      projects: 4,
      videos: 3,
      books: 3
    }
  });
  const [registerError, setRegisterError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (type, value) => {
    const newPreferences = { ...formData.preferences, [type]: value };
    const total = Object.values(newPreferences).reduce((sum, val) => sum + val, 0);
    
    // If total exceeds 10, adjust other values proportionally
    if (total > 10) {
      const otherTypes = Object.keys(newPreferences).filter(t => t !== type);
      const remainingUnits = 10 - newPreferences[type];
      
      if (remainingUnits >= 0) {
        // Distribute remaining units between other types
        const currentOtherTotal = otherTypes.reduce((sum, t) => sum + newPreferences[t], 0);
        
        if (currentOtherTotal > 0) {
          otherTypes.forEach(t => {
            newPreferences[t] = Math.round((newPreferences[t] / currentOtherTotal) * remainingUnits);
          });
          
          // Adjust for rounding errors
          const finalTotal = Object.values(newPreferences).reduce((sum, val) => sum + val, 0);
          if (finalTotal !== 10) {
            newPreferences[otherTypes[0]] += 10 - finalTotal;
          }
        } else {
          // Split remaining units equally
          const equalShare = Math.floor(remainingUnits / otherTypes.length);
          otherTypes.forEach(t => {
            newPreferences[t] = equalShare;
          });
          // Add remainder to first type
          newPreferences[otherTypes[0]] += remainingUnits - (equalShare * otherTypes.length);
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      preferences: newPreferences
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    try {
      await onRegister(formData);
      navigate('/login');
    } catch (error) {
      setRegisterError(error.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Create Account</h1>
        <p>Join LearnTech's AI-Powered Learning Platform</p>
        
        {registerError && <div className="error-message">{registerError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="preferences-section">
            <h3>Learning Preferences</h3>
            <p className="preferences-info">Select boxes to indicate your preferred learning style (total must be 10 boxes)</p>
            
            <div className="preference-group">
              <label>
                Projects ({formData.preferences.projects} units)
                <div className="preference-boxes-container">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={`projects-${index}`}
                      className={`preference-box projects ${index < formData.preferences.projects ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('projects', index + 1)}
                    />
                  ))}
                </div>
              </label>
            </div>

            <div className="preference-group">
              <label>
                Video Tutorials ({formData.preferences.videos} units)
                <div className="preference-boxes-container">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={`videos-${index}`}
                      className={`preference-box videos ${index < formData.preferences.videos ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('videos', index + 1)}
                    />
                  ))}
                </div>
              </label>
            </div>

            <div className="preference-group">
              <label>
                Reading Materials ({formData.preferences.books} units)
                <div className="preference-boxes-container">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={`books-${index}`}
                      className={`preference-box books ${index < formData.preferences.books ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('books', index + 1)}
                    />
                  ))}
                </div>
              </label>
            </div>

            <div className="total-units">
              Total: {Object.values(formData.preferences).reduce((sum, val) => sum + val, 0)} / 10 units
            </div>
          </div>
          
          <button type="submit" className="register-button">
            <UserPlus size={18} />
            Create Account
          </button>

          <div className="auth-switch">
            Already have an account?{' '}
            <button className="link-button" onClick={handleLogin}>
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 