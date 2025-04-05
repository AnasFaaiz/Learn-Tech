import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await onLogin(username, password);
    } catch (error) {
      setLoginError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <button className="register-link-button" onClick={handleRegister}>
        Register
      </button>
      <div className="login-form">
        <h1>LearnTech</h1>
        <p>AI-Powered Personalized Learning Platform</p>
        
        {loginError && <div className="error-message">{loginError}</div>}
        
        <form onSubmit={handleSubmit}>
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
}; 