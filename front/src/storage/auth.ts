import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export interface User {
    id: number
    user_name: string
}

type Auth = {
    state: 'idle',
    user?: User
} | { state: 'loading', user?: User } | { state: 'authenticated', user: User }

type AuthStore = {
    auth: Auth,
    setAuth: (auth: Auth) => void;
    reset: () => void;
}

const persistedAuthStore = persist<AuthStore>(
    (set) => ({
        auth: { state: 'idle' },
        setAuth: (auth) => set({ auth }),
        reset: () => set({ auth: { state: 'idle' } })
    }),
    {
        name: 'auth-storage'
    }
)

export const authStore = create<AuthStore>()(persistedAuthStore);