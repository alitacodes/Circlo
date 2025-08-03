// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 API: Making request to:', url);
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            
            if (refreshResponse.ok) {
              const { token } = await refreshResponse.json();
              localStorage.setItem('authToken', token);
              
              // Retry the original request with the new token
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
              };
              const retryResponse = await fetch(url, config);
              const retryData = await retryResponse.json();
              
              if (!retryResponse.ok) {
                throw new Error(retryData.error || `HTTP error! status: ${retryResponse.status}`);
              }
              
              return { success: true, data: retryData };
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw new Error('Authentication failed');
          }
        }
      }

      const data = await response.json();
      console.log('🌐 API: Response status:', response.status);
      console.log('🌐 API: Response data:', data);

      if (!response.ok) {
        const error = new Error(data.error || `HTTP error! status: ${response.status}`);
        if (data.details) {
          (error as any).details = data.details;
        }
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyAadhaar(aadhaarData: { aadhaarNumber: string; otp: string }) {
    return this.request('/auth/verify-aadhaar', {
      method: 'POST',
      body: JSON.stringify(aadhaarData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Items/Listings endpoints
  async getListings(params?: {
    category?: string;
    search?: string;
    location?: string;
    page?: number;
    limit?: number;
    owner_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const endpoint = `/items?${queryParams.toString()}`;
    console.log('🌐 API: Fetching listings from:', endpoint);
    const response = await this.request(endpoint);
    console.log('🌐 API: Listings response:', response);
    return response;
  }

  async getUserListings() {
    return this.request('/items/my');
  }

  async getUserProfile() {
    return this.request('/user/profile');
  }

  async getBookings(type: 'renter' | 'owner' = 'renter') {
    return this.request(`/bookings?type=${type}`);
  }

  // Payment methods
  async createPaymentOrder(paymentData: {
    booking_id: string;
    item_id: string;
    start_date: string;
    end_date: string;
  }) {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    booking_id: string;
  }) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getListing(id: string) {
    return this.request(`/items/${id}`);
  }

  // Single createListing method that handles FormData
  async createListing(listingData: FormData) {
    // Convert FormData to the expected format
    const jsonData = {
      title: listingData.get('title'),
      description: listingData.get('description'),
      category: listingData.get('category'),
      price: parseFloat(listingData.get('price') as string),
      price_unit: listingData.get('priceUnit'),
      location: listingData.get('location'),
      condition: listingData.get('condition'),
      brand: listingData.get('brand'),
      size: listingData.get('size'),
      is_vault_item: listingData.get('isVaultItem') === 'true',
      vault_story: listingData.get('vaultStory'),
      availability: listingData.get('availability')?.toString().split(','),
    };

    // Get the auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        error: 'Authentication required. Please log in.'
      };
    }

    return this.request('/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jsonData),
    });
  }

  async updateListing(id: string, listingData: FormData) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      headers: {},
      body: listingData,
    });
  }

  async deleteListing(id: string) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings endpoints
  async createBooking(bookingData: {
    item_id: string;
    start_date: string;
    end_date: string;
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, status: 'confirmed' | 'cancelled' | 'completed') {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Reviews endpoints
  async createReview(reviewData: {
    itemId: string;
    rating: number;
    comment: string;
  }) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getReviews(itemId: string) {
    return this.request(`/reviews?itemId=${itemId}`);
  }

  // Chat endpoints
  async getChats(userId: string) {
    return this.request(`/chats?userId=${userId}`);
  }

  async getChatMessages(chatId: string) {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId: string, message: string) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // User endpoints
  async updateUserProfile(userId: string, userData: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserKarma(userId: string) {
    return this.request(`/users/${userId}/karma`);
  }

  // Cultural Vault endpoints
  async getVaultItems() {
    return this.request('/vault/items');
  }

  async createVaultItem(itemData: FormData) {
    return this.request('/vault/items', {
      method: 'POST',
      headers: {},
      body: itemData,
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Database test
  async testDatabase() {
    return this.request('/test-hana');
  }

  async getBookingDetails(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }
}

export const apiService = new ApiService();
export default apiService;