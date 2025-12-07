import { apiClient } from './client';

export type LoginRequest = {
    email?: string,
    username?: string,
    password: string
}


export type User = {
    _id: string,
    username: string,
    email: string,
    name: string,
    role: 'user' | 'admin'
}

export const authApi = {
    async login(data: LoginRequest): Promise<User> {
        return apiClient<User>('/login', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    async logout(): Promise<void> {
        return apiClient("/logout", {method: "POST"});
    }
}