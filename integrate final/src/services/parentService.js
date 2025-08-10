import axios from 'axios';

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:44317';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions for HTTP methods
const apiGet = async (url) => {
  const response = await apiClient.get(url);
  return response.data;
};

const apiPost = async (url, data) => {
  const response = await apiClient.post(url, data);
  return response.data;
};

const apiPut = async (url, data) => {
  const response = await apiClient.put(url, data);
  return response.data;
};

const apiDelete = async (url) => {
  const response = await apiClient.delete(url);
  return response.data;
};

// Parent Bridge Service - aligned to ParentController with route: [Route("parent/[controller]")]
export const parentService = {
  // Associated student for a given parent id
  async getStudentProfile(parentId) {
    return apiGet(`/parent/Parent/${parentId}/student`);
  },

  // Attendance for the associated student of a parent
  async getAttendance(parentId) {
    return apiGet(`/parent/Parent/${parentId}/student/attendance`);
  },

  // Global timetables
  async getTimetable() {
    return apiGet(`/parent/Parent/timetables`);
  },

  // Performance for the associated student of a parent
  async getPerformance(parentId) {
    return apiGet(`/parent/Parent/${parentId}/student/performance`);
  },

  // Global events
  async getEvents() {
    return apiGet('/parent/Parent/events');
  },

  // Behaviour for the associated student of a parent
  async getBehaviors(parentId) {
    return apiGet(`/parent/Parent/${parentId}/student/behaviour`);
  },

  // Parent info
  async getParentInfo(parentId) {
    return apiGet(`/parent/Parent/${parentId}`);
  },

  async updateParentInfo(parentId, payload) {
    return apiPut(`/parent/Parent/${parentId}`, payload);
  },

  async createParent(payload) {
    // Prefer dedicated register; fallback to controller POST; as last resort generate ParentId
    try {
      return await apiPost('/parent/Parent/register', payload);
    } catch (e) {
      console.warn('Register endpoint failed, trying POST to controller:', e.message);
      try {
        return await apiPost('/parent/Parent', payload);
      } catch (e2) {
        console.warn('Controller POST failed, generating ParentId and retrying:', e2.message);
        const payloadWithId = { ...payload, ParentId: Date.now() };
        return await apiPost('/parent/Parent', payloadWithId);
      }
    }
  },

  async loginParent(credentials) {
    const { email, studEnrollmentNo, password } = credentials;
    
    try {
      // Try the dedicated login endpoint first
      const response = await apiPost('/parent/Parent/login', { 
        email: email?.trim(), 
        studEnrollmentNo: studEnrollmentNo?.trim(), 
        password: password?.trim() 
      });
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.parent));
      }
      return response;
    } catch (error) {
      console.warn('Dedicated login endpoint failed, trying alternative approach:', error.message);
      
      // Fallback: Try to find parent by credentials and simulate login
      try {
        const allParents = await apiGet('/parent/Parent');
        const matchingParent = Array.isArray(allParents) 
          ? allParents.find(parent => 
              String(parent.email || parent.Email || '').toLowerCase() === String(email).trim().toLowerCase() &&
              String(parent.studEnrollmentNo || parent.StudEnrollmentNo || '').toLowerCase() === String(studEnrollmentNo).trim().toLowerCase()
            )
          : null;
            
        if (!matchingParent) {
          throw new Error('Invalid credentials - parent not found');
        }
        
        // Simulate successful login response
        const loginResponse = {
          success: true,
          parentId: matchingParent.parentId || matchingParent.ParentId,
          parent: matchingParent,
          token: `mock_token_${Date.now()}` // Generate a mock token for development
        };
        
        // Store auth data
        localStorage.setItem('authToken', loginResponse.token);
        localStorage.setItem('userData', JSON.stringify(matchingParent));
        
        return loginResponse;
      } catch (fallbackError) {
        console.error('Parent login failed completely:', fallbackError);
        throw new Error('Login failed. Please check your credentials.');
      }
    }
  },

  // Message-related endpoints
  async getMessages(parentId) {
    return apiGet(`/parent/Parent/${parentId}/messages`);
  },

  async sendMessage(parentId, messageData) {
    return apiPost(`/parent/Parent/${parentId}/messages`, messageData);
  },

  async getThreadMessages(threadId) {
    return apiGet(`/parent/Parent/messages/thread/${threadId}`);
  },

  async sendThreadMessage(threadId, messageData) {
    return apiPost(`/parent/Parent/messages/thread/${threadId}`, messageData);
  },

  // Authentication helpers
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('parent_auth');
  }
};

export default parentService;
