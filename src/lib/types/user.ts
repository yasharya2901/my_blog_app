
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