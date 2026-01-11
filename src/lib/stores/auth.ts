import {atom, onMount} from 'nanostores';
import { type LoginRequest, type User } from '../types/user';
import { authApi } from '../api/auth';


export const $user = atom<User | null>(null);
export const $authLoading = atom<boolean>(true);

export async function checkAuth() {
    $authLoading.set(true);
    try {
        const user = await authApi.me();
        $user.set(user);
    } catch (error) {
        $user.set(null);
    } finally {
        $authLoading.set(false);
    }
}


export async function login(data: LoginRequest) {
    try {
        const user = await authApi.login(data);
        $user.set(user);
        $authLoading.set(false);
        return user;
    } catch (error: any) {
        $user.set(null);
        throw new Error("Invalid Credentials")
    }
}

export async function logout() {
    try {
        await authApi.logout();
    } catch (error) {
        console.error("Logout failed", error);
        throw new Error("Logout failed")
    } finally {
        $user.set(null);
        window.location.href = "/login";
    }
}

onMount($user, () => {
    if (typeof window !== 'undefined' && !$user.get()) {
        checkAuth();
    }
});
