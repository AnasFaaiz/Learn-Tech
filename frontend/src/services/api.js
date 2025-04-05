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


apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      // console.log(error.response.body)
      console.log('Intercepted 403 error, may need to refresh CSRF token');
    }
    return Promise.reject(error);
  }
);


apiClient.interceptors.request.use(config => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  config.withCredentials = true;
  return config;
});

// Authentication services
export const authService = {
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
export const courseService = {
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
  
  // New method to get a single course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Get course details error:', error);
      throw error;
    }
  },
  
  // Get course units
  getCourseUnits: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/units/`);
      return response.data;
    } catch (error) {
      console.error('Get course units error:', error);
      throw error;
    }
  },
  
  // Get unit topics
  getUnitTopics: async (unitId) => {
    try {
      const response = await apiClient.get(`/units/${unitId}/topics/`);
      return response.data;
    } catch (error) {
      console.error('Get unit topics error:', error);
      throw error;
    }
  },
  
  // Submit quiz answers
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
  },
  
  // Mark unit as completed
  markUnitCompleted: async (unitId) => {
    try {
      const response = await apiClient.post(`/units/${unitId}/complete/`);
      return response.data;
    } catch (error) {
      console.error('Mark unit completed error:', error);
      throw error;
    }
  }
};

// Learning path services
export const pathService = {
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

export default apiClient;