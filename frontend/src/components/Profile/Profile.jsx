import { useState } from 'react';
import { Trophy, Book, Star, Clock, Award, Upload, Loader, AlertCircle } from 'lucide-react';
import { updateProfileImage } from '../../services/api';
import './Profile.css';

const Profile = ({ user, userCourses, profileImage, onProfileImageUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Create local preview using URL.createObjectURL
      const imageUrl = URL.createObjectURL(file);
      onProfileImageUpdate(imageUrl);
      
      // Store in localStorage
      localStorage.setItem('profileImage', imageUrl);
      
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <div 
            className="profile-avatar"
            style={{
              backgroundColor: profileImage ? 'transparent' : 'var(--primary-color)',
              backgroundImage: profileImage ? `url(${profileImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!profileImage && (
              <>
                {user.first_name ? user.first_name[0] : user.username[0]}
                {user.last_name ? user.last_name[0] : ''}
              </>
            )}
          </div>
          <label 
            className={`profile-avatar-overlay ${isUploading ? 'uploading' : ''}`} 
            htmlFor="profile-upload"
          >
            {isUploading ? (
              <>
                <Loader size={24} className="spinner" />
                <span className="profile-avatar-text">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={24} />
                <span className="profile-avatar-text">Change Photo</span>
              </>
            )}
          </label>
          <input
            id="profile-upload"
            type="file"
            className="profile-upload-input"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {uploadError && (
            <div className="upload-error">
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card stats">
          <h2>Learning Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{userCourses.length}</span>
              <span className="stat-label">Courses Enrolled</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {userCourses.filter(course => course.is_completed).length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.round(userCourses.reduce((acc, course) => acc + course.progress, 0) / 
                (userCourses.length || 1))}%
              </span>
              <span className="stat-label">Avg. Progress</span>
            </div>
          </div>
        </div>

        <div className="profile-card achievements">
          <h2><Trophy size={20} /> Achievements</h2>
          <div className="achievement-list">
            <div className="achievement-item">
              <Star size={20} />
              <div>
                <h3>Quick Learner</h3>
                <p>Completed first course</p>
              </div>
            </div>
            <div className="achievement-item">
              <Clock size={20} />
              <div>
                <h3>Dedicated Student</h3>
                <p>Maintained a learning streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card courses">
          <h2><Book size={20} /> Active Courses</h2>
          <div className="course-list">
            {userCourses.map(course => (
              <div key={course.id} className="course-item">
                <div className="course-icon" 
                  style={{backgroundColor: course.course.image_color || '#7e57c2'}}>
                  {course.course.title[0]}
                </div>
                <div className="course-details">
                  <h3>{course.course.title}</h3>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{width: `${course.progress}%`}}
                    ></div>
                  </div>
                  <p>{course.progress}% Complete</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-card certificates">
          <h2><Award size={20} /> Certificates</h2>
          <div className="certificate-list">
            {userCourses
              .filter(course => course.is_completed)
              .map(course => (
                <div key={course.id} className="certificate-item">
                  <Award size={24} />
                  <div>
                    <h3>{course.course.title}</h3>
                    <p>Completed on {new Date(course.last_accessed).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;