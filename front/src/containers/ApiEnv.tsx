'use client';
import { ApiEnvStore, apiEnvStore } from "@/storage/env";
import { ChangeEventHandler, PropsWithChildren, createContext, useContext } from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css";

const envContext = createContext<ApiEnvStore>({} as any);

export const useApiEnv = () => useContext(envContext);

export const ApiEnvProvider = ({ children }: PropsWithChildren) => {
  const state = apiEnvStore((state) => state);
  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    state.setEnv(event.target.checked ? 'rust' : 'node');
  }
  return (
    <envContext.Provider value={state}>
      <div className="flex gap-4 sticky top-0" style={{ padding: 10 }}>
        <Toggle icons={false} defaultChecked={state.env === 'rust'} onChange={onChange} className="" />
        <span>{state.env === 'rust' ? 'Rust' : 'Node'}</span>
      </div>
      {children}
    </envContext.Provider>
  )
}