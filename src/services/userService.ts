import { apiService } from './api';

export interface UserStats {
  total: number;
  // Example: byRole: { admin: 1, receptionist: 3, patient: 100 }
  // The actual structure of byRole might vary based on API response.
  // For now, we'll assume it's a Record<string, number> as per design doc "répartition par rôle"
  byRole: Record<string, number>;
}

// Define more user-related types here as needed for full User module
// export interface User { ... }
// export interface CreateUserDto { ... }
// export interface UpdateUserDto { ... }

export const userService = {
  async getUserStats(): Promise<UserStats> {
    const response = await apiService.get<UserStats>('/users/stats');
    return response.data;
  },

  // Placeholder for future user management functions
  // async getUsers(page: number, limit: number, filters: any): Promise<PaginatedResponse<User>> { ... }
  // async getUser(id: string): Promise<User> { ... }
  // async createUser(data: CreateUserDto): Promise<User> { ... }
  // async updateUser(id: string, data: UpdateUserDto): Promise<User> { ... }
  // async deleteUser(id: string): Promise<void> { ... }
};
