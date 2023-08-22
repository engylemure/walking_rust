'use client';

import { useAuth } from "@/hooks/useAuth";
import { PropsWithChildren, createContext, useContext } from "react";

type AuthContext = ReturnType<typeof useAuth>;

const authContext = createContext({ auth: { state: 'idle' } } as AuthContext);

export const useAuthContext = () => useContext(authContext);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  return <authContext.Provider value={useAuth()}>{children}</authContext.Provider>
}