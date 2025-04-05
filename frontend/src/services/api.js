import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for handling cookies/sessions
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to set Basic Auth header
export const setBasicAuth = (username, password) => {
  const encodedCredentials = btoa(`${username}:${password}`);
  apiClient.defaults.headers.common['Authorization'] = `Basic ${encodedCredentials}`;
};

// Function to clear auth headers
export const clearAuth = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

// Simplified error handling without CSRF concerns
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log(`Error ${error.response.status}: ${error.response.statusText}`);
      
      // Try to re-authenticate on 401/403 errors
      if (error.response.status === 401 || error.response.status === 403) {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        
        if (username && password) {
          setBasicAuth(username, password);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Remove CSRF handling and rely solely on Basic Auth
apiClient.interceptors.request.use(config => {
  // Always ensure credentials are included
  config.withCredentials = true;
  
  // Ensure the auth header is present on each request
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  
  if (username && password) {
    const encodedCredentials = btoa(`${username}:${password}`);
    config.headers['Authorization'] = `Basic ${encodedCredentials}`;
  }
  
  return config;
});

// Authentication services
const authService = {
  login: async (username, password) => {
    try {
      // Set Basic Auth header
      setBasicAuth(username, password);
      
      // Attempt login
      const response = await apiClient.get('/auth/user/');
      
      // Store the credentials for future requests
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      
      return response.data;
    } catch (error) {
      clearAuth();
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      clearAuth();
      localStorage.removeItem('username');
      localStorage.removeItem('password');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');
      
      if (username && password) {
        setBasicAuth(username, password);
      }
      
      const response = await apiClient.get('/auth/user/');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Check if user is authenticated based on stored credentials
  isAuthenticated: () => {
    return localStorage.getItem('username') && localStorage.getItem('password');
  }
};

// Course services
const courseService = {
  getRecommended: async () => {
    try {
      const response = await apiClient.get('/recommended/');
      return response.data;
    } catch (error) {
      console.error('Get recommended courses error:', error);
      throw error;
    }
  },
  
  getUserCourses: async () => {
    try {
      const response = await apiClient.get('/user-courses/');
      return response.data;
    } catch (error) {
      console.error('Get user courses error:', error);
      throw error;
    }
  },
  
  updateCourseProgress: async (userCourseId, progress) => {
    try {
      const response = await apiClient.patch(`/user-courses/${userCourseId}/`, {
        progress
      });
      return response.data;
    } catch (error) {
      console.error('Update course progress error:', error);
      throw error;
    }
  },
  
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Get course details error:', error);
      throw error;
    }
  },
  
  getCourseUnits: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/units/`);
      return response.data;
    } catch (error) {
      console.error('Get course units error:', error);
      throw error;
    }
  },
  
  getCourseProgress: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/progress/`);
      return response.data;
    } catch (error) {
      console.error('Get course progress error:', error);
      throw error;
    }
  },
  
  markTopicCompleted: async (topicId) => {
    try {
      const response = await apiClient.post('/topics/mark-completed/', {
        topic_id: topicId
      });
      return response.data;
    } catch (error) {
      console.error('Mark topic completed error:', error);
      throw error;
    }
  },
  
  markUnitCompleted: async (unitId) => {
    try {
      const response = await apiClient.post('/units/mark-completed/', {
        unit_id: unitId
      });
      return response.data;
    } catch (error) {
      console.error('Mark unit completed error:', error);
      throw error;
    }
  },
  
  getUnitTopics: async (unitId) => {
    try {
      const response = await apiClient.get(`/units/${unitId}/topics/`);
      return response.data;
    } catch (error) {
      console.error('Get unit topics error:', error);
      throw error;
    }
  },
  
  submitQuiz: async (quizId, answers) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/submit/`, {
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Submit quiz error:', error);
      throw error;
    }
  }
};

// Learning path services
const pathService = {
  getUserPaths: async () => {
    try {
      const response = await apiClient.get('/learning-paths/');
      return response.data;
    } catch (error) {
      console.error('Get learning paths error:', error);
      throw error;
    }
  },
  
  getMilestones: async (pathId) => {
    try {
      const response = await apiClient.get(`/learning-paths/${pathId}/milestones/`);
      return response.data;
    } catch (error) {
      console.error('Get milestones error:', error);
      throw error;
    }
  }
};

// Learning buddy services
const buddyService = {
  getLearningProfile: async () => {
    try {
      const response = await apiClient.get('/learning-profile/');
      return response.data;
    } catch (error) {
      console.error('Get learning profile error:', error);
      throw error;
    }
  },
  
  updateLearningProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/learning-profile/update/', profileData);
      return response.data;
    } catch (error) {
      console.error('Update learning profile error:', error);
      throw error;
    }
  },
  
  getChatHistory: async (courseId) => {
    try {
      const response = await apiClient.get(`/course/${courseId}/chat-history/`);
      return response.data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  },
  
  sendMessage: async (courseId, message) => {
    try {
      const response = await apiClient.post('/learning-buddy/chat/', {
        course_id: courseId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },
  
  startSession: async (courseId) => {
    try {
      const response = await apiClient.post('/course-session/start/', {
        course_id: courseId
      });
      return response.data;
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  },
  
  endSession: async (sessionId) => {
    try {
      const response = await apiClient.post('/course-session/end/', {
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('End session error:', error);
      throw error;
    }
  },
  
  saveQuizResult: async (courseId, quizData) => {
    try {
      const response = await apiClient.post('/learning-buddy/quiz-result/', {
        course_id: courseId,
        ...quizData
      });
      return response.data;
    } catch (error) {
      console.error('Save quiz result error:', error);
      throw error;
    }
  }
};

// Add the buddy service to your exports
export { apiClient, authService, courseService, pathService, buddyService };