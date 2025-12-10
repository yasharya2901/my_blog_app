import type { LoginRequest, User } from '../types/user';
import { apiClient } from './client';



export const authApi = {
    async login(data: LoginRequest): Promise<User> {
        return apiClient<User>('/login', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    async logout(): Promise<void> {
        return apiClient("/logout", {method: "POST"});
    },

    async me(): Promise<User> {
        return apiClient<User>("/me", {method: "GET"})
    }
}