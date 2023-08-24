import { useApiEnv } from "@/containers/ApiEnv";
import { User, authStore } from "@/storage/auth";
import { ApiEnv } from "@/storage/env";
import { customFetch } from "@/utils/api";
import useSWRMutation from 'swr/mutation';

function loginFetcher(_: any, { arg }: { arg: string }, env: ApiEnv) {
  return customFetch<User>('login', { method: 'POST', payload: { userName: arg }, env })
}

function signupFetcher(_: any, { arg }: { arg: string }, env: ApiEnv) {
  return customFetch<User>('signup', { method: 'POST', payload: { userName: arg }, env })
}

function logoutFetcher(_: any, env: ApiEnv) {
  return customFetch<never>('logout', { method: 'POST', payload: {}, env });
}

export function useAuth() {
  const { env } = useApiEnv();
  const { auth, setAuth, reset } = authStore((state) => state);
  const _loginFetcher = (key: any, options: { arg: string }) => loginFetcher(key, options, env)
  const login = useSWRMutation('user', _loginFetcher , {
    onSuccess: (user) => setAuth({ state: 'authenticated', user }),
  })
  const _signupFetcher = (key: any, options: { arg: string }) => signupFetcher(key, options, env)
  const signup = useSWRMutation('user', _signupFetcher, {
    onSuccess: (user) => setAuth({ state: 'authenticated', user })
  });
  const logout = useSWRMutation('user', (key) => logoutFetcher(key, env), {
    onSuccess: () => reset()
  });
  return {
    auth,
    login,
    signup,
    logout
  }
}