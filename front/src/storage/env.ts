import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export type ApiEnv = 'node' | 'rust'

export type ApiEnvStore = {
    env: ApiEnv,
    setEnv: (env: ApiEnv) => void;
}

const persistedApiEnvStore = persist<ApiEnvStore>(
    (set) => ({
        env: 'node',
        setEnv: (env) => set({ env })
    }),
    {
        name: 'env-storage'
    }
)

export const apiEnvStore = create<ApiEnvStore>()(persistedApiEnvStore);