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
  signup: async (data: {
    email: string;
    password: string;
    fullName: string;
    userType: 'individual' | 'team' | 'organization';
  }) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (email: string, password: string) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  googleAuth: async (data: {
    googleId: string;
    email: string;
    fullName: string;
    profilePicture?: string;
    userType?: 'individual' | 'team' | 'organization';
  }) => {
    return fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
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

  forgotPassword: async (email: string) => {
    return fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return fetchWithAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  updateProfile: async (data: { fullName?: string; profilePicture?: string }) => {
    return fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Business Card API
export const businessCardApi = {
  getAll: async () => {
    return fetchWithAuth('/business-cards');
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/business-cards/${id}`);
  },

  getPublic: async (id: string) => {
    return fetch(`${API_URL}/business-cards/public/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(res));
  },

  create: async (data: {
    fullName: string;
    email: string;
    phone?: string;
    mobileNumber?: string;
    position?: string;
    company?: string;
    department?: string;
    address?: string;
    website?: string;
    profilePicture?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      github?: string;
    };
    cardTheme?: string;
    primaryColor?: string;
    isPublic?: boolean;
  }) => {
    return fetchWithAuth('/business-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    fullName: string;
    email: string;
    phone: string;
    mobileNumber: string;
    position: string;
    company: string;
    department: string;
    address: string;
    website: string;
    profilePicture: string;
    socialLinks: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
      github?: string;
    };
    cardTheme: string;
    primaryColor: string;
    isPublic: boolean;
    isActive: boolean;
  }>) => {
    return fetchWithAuth(`/business-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/business-cards/${id}`, {
      method: 'DELETE',
    });
  },

  getAnalytics: async (id: string) => {
    return fetchWithAuth(`/business-cards/${id}/analytics`);
  },
};

// Organization API
export const organizationApi = {
  getAll: async () => {
    return fetchWithAuth('/organizations');
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/organizations/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => {
    return fetchWithAuth('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    logo: string;
    website: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
  }>) => {
    return fetchWithAuth(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Team API
export const teamApi = {
  getAll: async () => {
    return fetchWithAuth('/teams');
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/teams/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    organizationId?: string;
  }) => {
    return fetchWithAuth('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
  }>) => {
    return fetchWithAuth(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/teams/${id}`, {
      method: 'DELETE',
    });
  },

  addMember: async (teamId: string, userId: string, role: 'member' | 'team_admin' = 'member') => {
    return fetchWithAuth(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  },

  removeMember: async (teamId: string, memberId: string) => {
    return fetchWithAuth(`/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
    });
  },

  updateMemberRole: async (teamId: string, memberId: string, role: 'member' | 'team_admin') => {
    return fetchWithAuth(`/teams/${teamId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

// Admin API (Super Admin only)
export const adminApi = {
  getStats: async () => {
    return fetchWithAuth('/admin/stats');
  },

  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return fetchWithAuth(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUserById: async (id: string) => {
    return fetchWithAuth(`/admin/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<{
    fullName: string;
    role: string;
    userType: string;
    isActive: boolean;
    isEmailVerified: boolean;
  }>) => {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string) => {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  permanentDeleteUser: async (id: string) => {
    return fetchWithAuth(`/admin/users/${id}/permanent`, {
      method: 'DELETE',
    });
  },

  getOrganizations: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return fetchWithAuth(`/admin/organizations${query ? `?${query}` : ''}`);
  },

  getTeams: async (params?: { page?: number; limit?: number; search?: string; organizationId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return fetchWithAuth(`/admin/teams${query ? `?${query}` : ''}`);
  },

  getBusinessCards: async (params?: { page?: number; limit?: number; search?: string; userId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return fetchWithAuth(`/admin/business-cards${query ? `?${query}` : ''}`);
  },

  getActivity: async (limit?: number) => {
    return fetchWithAuth(`/admin/activity${limit ? `?limit=${limit}` : ''}`);
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
