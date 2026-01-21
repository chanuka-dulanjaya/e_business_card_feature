// Use relative URL in production, absolute URL in development
const API_URL = (import.meta as any).env?.VITE_API_URL ||
  (import.meta.env?.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authApi = {
  signup: async (email: string, password: string, fullName: string, role: string = 'user') => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
  },

  login: async (email: string, password: string) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async () => {
    return fetchWithAuth('/auth/me');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return fetchWithAuth('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Employee API
export const employeeApi = {
  getAll: async () => {
    return fetchWithAuth('/employees');
  },

  getById: async (id: string) => {
    return fetch(`${API_URL}/employees/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res));
  },

  create: async (employeeData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
    mobileNumber?: string;
    profilePicture?: string;
    position?: string;
    address?: string;
  }) => {
    return fetchWithAuth('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  update: async (id: string, employeeData: {
    fullName?: string;
    role?: string;
    mobileNumber?: string;
    profilePicture?: string;
    position?: string;
    address?: string;
  }) => {
    return fetchWithAuth(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },
};
